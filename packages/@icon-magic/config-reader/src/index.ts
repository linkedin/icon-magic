import { IconConfigHash } from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';
import * as glob from 'glob';
import * as path from 'path';

import { Config } from './config';
import { exists, isDirectory } from './helpers/files';

const CONFIG_FILES = ['iconrc.json', 'iconrc.js'];
const LOGGER = new Logger('icon-magic:config-reader/index');

export * from './config-loader';
export * from './helpers/hash';
export * from './helpers/files';

/**
 * Constructs a map of the icon and closest config to the icon traversing up
 * @param inputPaths the set of input paths to check
 * @returns a map of the icon and it's config JSON
 */
export function getIconConfigSet(inputPaths: string[]): IconConfigHash {
  // get all input paths that exist
  const validInputDirs = processPaths(inputPaths);

  LOGGER.debug(`Valid Input Paths: ${validInputDirs}`);

  // check if there's atleast one valid input path
  if (!validInputDirs.length) {
    throw new Error('No valid input directories');
  }

  // find the set of config files within each input path (deduping as we go along)
  const configFiles: Set<string> = new Set();
  for (const inputDir of validInputDirs) {
    // add each file to the set, deduping along the way
    findFilesSync(inputDir, CONFIG_FILES).forEach(file =>
      configFiles.add(file)
    );
  }

  // construct the config hash
  return new Config([...configFiles]).iconConfigHash;
}

/**
 * Gets a list of sanitized input directories
 * @param inputPaths list of input paths to validate and clean up
 * @returns list of valid directories amongst them
 */
function processPaths(inputPaths: string[]): string[] {
  const inputDirs: string[] = [];
  if (inputPaths && inputPaths.length) {
    for (const dir of inputPaths) {
      const normalizedPath = path.resolve(path.normalize(dir));
      if (exists(normalizedPath) && isDirectory(normalizedPath)) {
        inputDirs.push(normalizedPath);
      } else {
        throw new Error(`${normalizedPath} does not exist.`);
      }
    }
  } else {
    inputDirs.push(process.cwd());
  }
  return inputDirs;
}

/**
 * Gets paths of all matching files within a directory, however deep
 * @param dir directory to find the files
 * @param files list of files to find
 * @returns list of paths to the files found
 */
function findFilesSync(dir: string, files: string[]): string[] {
  return glob.sync(`**/*(${files.join('|')})`, {
    cwd: dir,
    dot: true,
    absolute: true
  });
}
