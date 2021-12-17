import * as debug from "debug";
import * as os from "os";
import * as puppeteer from "puppeteer";

const DEBUG = debug('icon-magic:svg-to-png');
const NUM_CPUS = os.cpus().length - 1;
let WIN_POOL: puppeteer.Browser[] = [];
let PAGE_POOL: Promise<puppeteer.Page>[] = [];
let hasBeenInit: false | Promise<boolean> = false;

async function init(options: puppeteer.LaunchOptions): Promise<boolean> {
  if (hasBeenInit) { return hasBeenInit; }
  DEBUG(`Running browser pool init.`);

  for (let i = 0; i < (NUM_CPUS); i++) {
    const win = await puppeteer.launch(options);
    const pagePromise = win.newPage();
    WIN_POOL.push(win);
    PAGE_POOL.push(pagePromise);
  }

  DEBUG(`Browser pool init complete.`);
  return true;
}

let idx = 0;
export async function run<K>(func: (page: puppeteer.Page) => Promise<K>): Promise<K> {
  hasBeenInit = init({}); // Ensure pool is init
  await hasBeenInit;
  let res: K;
  const index = idx;
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
  for (const window of WIN_POOL) { await window.close(); }
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