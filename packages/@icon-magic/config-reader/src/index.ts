import * as path from 'path';
import { Config } from './config';
import { IconSetHashInterface } from '@icon-magic/icon-models/src/interface';
import {
  exists,
  isDirectory
} from '@icon-magic/icon-models/dist/src/utils/files';

const glob = require('glob');

const CONFIG_FILES = [
  '.iconrc.json',
  '.iconrc.js',
  '.iconrc',
  'iconrc.json',
  'iconrc.js',
  'iconrc'
];

export function getIconSetwithConfigs(
  inputPaths: string[]
): IconSetHashInterface {
  const validInputDirs = processPaths(inputPaths);
  if (!validInputDirs.length) {
    throw new Error('Input paths are not found!');
  }
  let configFiles: string[] = [];
  for (let inputDir of validInputDirs) {
    configFiles = configFiles.concat(findFilesSync(inputDir, CONFIG_FILES));
  }
  // dedup the set of config files
  configFiles = [...new Set(configFiles)];

  let iconSet = new Config(configFiles);

  return iconSet.getIconSetHash();
}

/**
 * Gets a list of input directories after validating that they exist
 */
function processPaths(inputPaths: string[]): string[] {
  let inputDirs: string[] = [];
  if (inputPaths && inputPaths.length) {
    for (let dir of inputPaths) {
      let normalizedPath = path.resolve(path.normalize(dir));
      if (exists(normalizedPath) && isDirectory(normalizedPath)) {
        inputDirs.push(normalizedPath);
      }
    }
  } else {
    inputDirs.push(process.cwd());
  }
  return inputDirs;
}

/**
 * Gets paths of all matching files within a directory
 * @param dir directory to find the files
 * @param files list of files to find
 */
function findFilesSync(dir: string, files: string[]): string[] {
  return glob.sync(`**/*(${files.join('|')})`, {
    cwd: dir,
    dot: true,
    absolute: true
  });
}
