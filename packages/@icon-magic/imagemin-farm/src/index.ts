import * as cluster from 'cluster';

import * as debug from 'debug';

import { minifyFile } from './minify';

const DEBUG = debug('icon-magic:png-minify');
const WORKERS: cluster.Worker[] = [];
const STATUS: Map<number, WorkerState> = new Map();

const isNull = (v: any): v is null => v === null;

interface ParentMessage {
  cmd: 'minify' | 'stop' | 'kill';
  msg: any;
}

interface ChildMessage {
  cmd: 'ack' | 'done';
  msg: any;
}

interface Waiter {
  resolve: (val: Result) => void;
  reject: (val: string) => void;
}

interface WorkerState {
  total: number;
  remaining: Map<number, Waiter>;
}


function formatStatus(status: WorkerState): WorkerStatus {
  return {
    total: status.total,
    remaining: status.remaining.size,
    progress: ((status.total - status.remaining.size) / status.total) || null
  };
}

export interface WorkerStatus {
  total: number;
  remaining: number;
  progress: number | null;
}

export interface ProcessStatus {
  total: number;
  remaining: number;
  progress: number;
  workers: WorkerStatus[];
}

export interface Result {
  path: string;
  worker: number;
  status: ProcessStatus;
}

const SUBSCRIBERS: Set<Listener> = new Set();
export type Listener = (res: ProcessStatus) => void;
export function subscribe(func: Listener) { SUBSCRIBERS.add(func); }

if (cluster.isMaster) {

  // Run this file in child processes.
  cluster.setupMaster({ exec: __filename, });

  // Start workers.
  const numCPUs = require('os').cpus().length - 1;
  DEBUG(`Starting ${numCPUs} imagemin worker processes.`);
  for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
    WORKERS.push(worker);
    STATUS.set(worker.id, {
      total: 0,
      remaining: new Map(),
    });
  }

  // Listen for messages
  cluster.on('message', (worker: cluster.Worker, message: ChildMessage) => {
    DEBUG(`Master receives message '${message.cmd}' from worker ${worker.id}.\n${JSON.stringify(message.msg, null, 2)}`);

    // Fetch this worker's status object.
    let workerStatus = STATUS.get(worker.id);
    if (!workerStatus) { throw new Error(`Received message from unknown child process ${process.pid}.`); }

    // Fetch the worker's completed job's promise resolver.
    let promise = workerStatus.remaining.get(message.msg.uid);
    if (!promise) {
      throw new Error(`Child process ${process.pid} attempted to resolve unknown minification promise: \n\n Message: \n${JSON.stringify(message, null, 2)} \n\n Promises: [${[...workerStatus.remaining.keys()]}]`);
    }

    // If child is notifying us it's done with an image, update its state
    if (message.cmd === 'done') {
      workerStatus.remaining.delete(message.msg.uid);
    }

    // Compute latest stats across all workers and return.
    let statuses = [...STATUS.values()].map(formatStatus);
    let numWithJobs = statuses.reduce((count, s) => isNull(s.progress) ? count : count+1, 0);
    let status: ProcessStatus = {
      total: statuses.reduce((sum, s) => s.total + sum, 0),
      remaining: statuses.reduce((sum, s) => s.remaining + sum, 0),
      progress: statuses.map((s) => isNull(s.progress) ? null : s.progress / numWithJobs).reduce((sum: number, v) => isNull(v) ? sum : v + sum, 0),
      workers: statuses
    };

    // If we're done here, Resolve with the run's results.
    if (message.cmd === 'done') {
      promise.resolve({
        path: message.msg.path,
        worker: worker.id,
        status
      });
    }

    // Notify all subscribers of latest status. This happens on `ack` and `done`
    for (let sub of SUBSCRIBERS) { sub(status); }

  });

  // TODO: Re-spawn worker if died unexpectedly.
  cluster.on('exit', (worker, code, _signal) => {
    if (worker.exitedAfterDisconnect === true) {
      DEBUG('Oh, it was just voluntary – no need to worry');
    }
    DEBUG(`Worker ${worker.id} exited unexpectedly with code ${code}.`);
  });

} else {
  let JOB_CHAIN = Promise.resolve();
  process.on('message', async function(message: ParentMessage) {
    switch(message.cmd) {
      case 'minify':
        DEBUG(`Worker '${process.pid}' receives message '${message.cmd}'.\n${JSON.stringify(message.msg, null, 2)}`);
        process.send!({ cmd: 'ack', msg: message.msg });
        JOB_CHAIN = JOB_CHAIN.then(async () => {
          await minifyFile(message.msg.path);
          process.send!({ cmd: 'done', msg: message.msg });
        });
        break;
      case 'kill':
        process.kill(0);
        break;
      default: break;
    }
  });

}

let idx = 0;
let UID = 0; // TODO: Make incrementing hex so we don't run out at MAX_INT
export function minify(path: string): Promise<Result> {
  DEBUG(`Starting minification task for ${path}.`);
  let localId = UID++;
  let worker = WORKERS[idx];
  let state = STATUS.get(worker.id);
  idx = (idx + 1) % WORKERS.length;
  if (!state) { throw new Error(`Can not find worker state for pid ${worker.id}.`); }
  return new Promise<Result>((resolve, reject) => {
    state!.remaining.set(localId, { resolve, reject });
    state!.total += 1;
    worker.send({ cmd: 'minify', msg: { path, uid: localId } });
  });
}
