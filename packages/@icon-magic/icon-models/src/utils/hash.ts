import * as crypto from 'crypto';

/**
 * Creates a hash from a string or Buffer
 * @param contents the string or Buffer to create the hash from
 * @returns hash of the passed in string or Buffer
 */
export function createHash(contents: string | Buffer): string {
  return crypto
    .createHash('md5')
    .update(contents)
    .digest('hex');
}

