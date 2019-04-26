import * as fs from 'fs-extra';
import * as path from 'path';

import { Content } from '../interface';

export type FileType = 'svg' | 'png' | 'webp' | 'json';

export function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
}

export function exists(path: string): boolean {
  return fs.existsSync(path);
}

export function isTypeSVG(filePath: string): boolean {
  return path.parse(filePath).ext === '.svg';
}

export async function getFileContents(filePath: string) {
  switch (path.extname(filePath)) {
    case '.svg':
      return await getSvgFromFile(filePath);
    default:
      // this should cover pngs as well as webps
      return await fs.readFile(filePath);
  }
}

export async function saveContentToFile(
  filePath: string,
  fileName: string,
  content: Content,
  type: FileType
) {
  let options;
  if (type === 'svg') {
    options = { encoding: 'utf-8' };
  }
  await fs.mkdirp(filePath);
  return await fs.writeFile(
    path.join(`${filePath}/${fileName}.${type}`),
    content,
    options
  );
}

async function getSvgFromFile(filePath: string): Promise<string> {
  const svgContent = await fs.readFile(filePath, { encoding: 'utf8' });
  // remove trailing new lines and whitespaces from the string
  return svgContent.trim();
}
