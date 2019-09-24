import * as crypto from 'crypto';

export function createHash(contents: string|Buffer): string {
  return crypto
  .createHash('md5')
  .update(contents)
  .digest('hex');
}