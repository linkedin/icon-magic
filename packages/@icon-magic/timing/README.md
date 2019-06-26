# @icon-magic/timing

This package handles timing using Node.js' [`process.hrtime()`](https://nodejs.org/api/process.html#process_process_hrtime) function.

## Usage

```ts
// Import the timing module module
import { timer } from '@icon-magic/timing';

const TIMER = timer();

function doSomething() {
  TIMER.start();
  /* Something is getting done */
  LOGGER.info(`${TIMER.end()}`);
}
```

## Methods

The `timer` object has the following methods:

/_ To start the timer _/

- start()

/_ To end the timer, returns elapsed time _/

- end()
