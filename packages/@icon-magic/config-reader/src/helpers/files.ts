import * as fs from 'fs-extra';

export function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
}

export function exists(path: string): boolean {
  return fs.existsSync(path);
}
