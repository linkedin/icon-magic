import * as os from "os";

import * as debug from "debug";
import * as puppeteer from "puppeteer";

const DEBUG = debug('icon-magic:svg-to-png');
const NUM_CPUS = os.cpus().length - 1;
let WIN_POOL: puppeteer.Browser[] = [];
let PAGE_POOL: Promise<puppeteer.Page>[] = [];
let hasBeenInit: boolean | Promise<boolean | void> = false;

async function init(options: puppeteer.LaunchOptions): Promise<boolean | void> {
  if (hasBeenInit) { return hasBeenInit; }
  DEBUG(`Running browser pool init.`);

  for (let i = 0; i < (NUM_CPUS); i++) {
    let win = await puppeteer.launch(options);
    let pagePromise = win.newPage();
    WIN_POOL.push(win);
    PAGE_POOL.push(pagePromise);
  }

  DEBUG(`Browser pool init complete.`);
  return hasBeenInit = true;
}

let idx = 0;
export async function run<K=any>(func: (page: puppeteer.Page) => Promise<K>): Promise<K> {
  hasBeenInit = init({ headless: true }); // Ensure pool is init
  await hasBeenInit;
  let res: K;
  let index = idx;
  idx = (idx + 1) % PAGE_POOL.length;
  PAGE_POOL[index] = PAGE_POOL[index].then(async (page) => {
    res = await func(page);
    return page;
  });
  await PAGE_POOL[index];
  return res!;
}

async function clean() {
  DEBUG(`Cleaning browser pool.`);
  for (let window of WIN_POOL) { await window.close(); }
  hasBeenInit = false;
  WIN_POOL = [];
  PAGE_POOL = [];
  DEBUG(`Browser pool cleaned.`);
}

//do something when app is closing
process.on('exit', clean);

//catches ctrl+c event
process.on('SIGINT', clean);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', clean);
process.on('SIGUSR2', clean);

//catches uncaught exceptions
process.on('uncaughtException', clean);