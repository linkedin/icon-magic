import * as debugGenerator from 'debug';
import * as fs from 'fs-extra';
import * as path from 'path';
const importFresh = require('import-fresh');

const debug = debugGenerator('icon-magic:icon-models:plugin-manager');

/**
 * Loads a JavaScript configuration from a file.
 * @param filePath The filename to load.
 * @returns  The configuration object from the file.
 */
function loadJSConfigFile(filePath: string) {
  debug(`Loading JS config file: ${filePath}`);
  try {
    return importFresh(filePath);
  } catch (e) {
    debug(`Error reading JavaScript file: ${filePath}`);
    throw new Error(
      `Cannot read config file: ${filePath}\nError: ${e.message}`
    );
  }
}

/**
 * Loads a JSON configuration from a file.
 * @param filePath The filename to load.
 * @returns The configuration object from the file.
 */
function loadJSONConfigFile(filePath: string) {
  debug(`Loading JSON config file: ${filePath}`);

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    debug(`Error reading JSON file: ${filePath}`);
    throw new Error(
      `Cannot read config file: ${filePath}\nError: ${e.message}`
    );
  }
}

/**
 * Inspects the file path to determine the correctly way to load the config file.
 * @param file The path to the configuration.
 * @returns The configuration information.
 */
export function loadConfigFile(filePath: string) {
  let config;
  switch (path.extname(filePath)) {
    case '.js':
      config = loadJSConfigFile(filePath);
      break;

    case '.json':
    case '':
      config = loadJSONConfigFile(filePath);
      break;
    default:
      throw new Error(
        `ConfigLoaderError: ${filePath} does not have a supported extension. Config files need to be .js or .json`
      );
  }
  return config;
}
