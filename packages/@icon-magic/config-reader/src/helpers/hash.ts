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

/**
 * Checks if the `sourceHash` of the saved asset matches the computed hash of
 * the asset that's about to be taken through the generation process.
 * @param currentAssetHash the hash of asset being processed in the generate step
 * @param savedAssetHash the hash of the saved asset that's written to the output path
 * @returns A promise that resolves to a Boolean which states whether the saved asset and the current
 * asset are the same.
 */
export async function compareAssetHashes(
  currentAssetHash: string | undefined,
  savedAssetHash: string | undefined
): Promise<boolean> {
  return !!savedAssetHash && currentAssetHash === savedAssetHash;
}

