import * as os from "os";

import * as puppeteer from "puppeteer";

const MAX_CPUS = 1;
const NUM_CPUS = os.cpus().length - 1;

let WIN_POOL: puppeteer.Browser[] = [];
let PAGE_POOL: Promise<puppeteer.Page>[] = [];
let hasBeenInit = false;

async function init(options: puppeteer.LaunchOptions): Promise<void> {

  if (hasBeenInit) { return; }
  hasBeenInit = true;

  for (let i = 0; i < (MAX_CPUS || NUM_CPUS); i++) {
    let win = await puppeteer.launch(options);
    let pagePromise = win.newPage();
    WIN_POOL.push(win);
    PAGE_POOL.push(pagePromise);
  }
}

let idx = 0;
export async function run<K=any>(func: (page: puppeteer.Page) => Promise<K>): Promise<K> {
  await init({ headless: true }); // Ensure pool is init
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
  for (let window of WIN_POOL) { await window.close(); }
  WIN_POOL = [];
  PAGE_POOL = [];
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