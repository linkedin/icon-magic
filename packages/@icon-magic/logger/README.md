# @icon-magic/logger

---

This package is responsible for exposing all the logging functionality for
icon-magic. It contains a wrapper around winston.js for including the filename
from where the logs are generated as a label in the logged message.

Logs are written to the following simulataneously:

1. console - logs of all levels
2. icon-magic-run.log - logs of all levels
3. icon-magic-error.log - only error logs

## Usage

```ts
// Import the logger module and it's interface
import { Logger, logger } from '@icon-magic/logger';

// Instantiate by passing the name of the file. This will be a label in the log message
const LOGGER: logger = logger('icon-magic:icon-models:asset');

// Log a debug message
LOGGER.debug('Icon generation has begun');

// Log an error message
LOGGER.error('Oh no! An error has occurred!');
```

This will print logs of the following format:

```
<timestamp> [<label>] <logLevel> <msg>
```

For example,

```
2019-05-15T17:40:40.056Z [icon-magic:icon-models:asset] debug: Asset test created in /Users/rchitloo/workspace/artdeco-icons-source_trunk/icons/shadows
2019-05-15T17:40:40.060Z [icon-magic:icon-models:asset] debug: Asset creatingError created in /Users/rchitloo/workspace/artdeco-icons-source_trunk/icons/shadows
2019-05-15T17:40:40.060Z [icon-magic:icon-models:icon] error: MissingVariantError: Variant /Users/rchitloo/workspace/artdeco-icons-source_trunk/icons/shadows/creatingError.svg missing for icon /Users/rchitloo/workspace/artdeco-icons-source_trunk/icons/shadows
```

## Methods

The `logger` object exposes the following methods from `winston.logger`

- debug()
- info()
- error()
