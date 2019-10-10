import * as crypto from 'crypto';
import { Asset } from '../';
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
 * @param currentAsset the asset being processed in the generate step
 * @param savedAsset the config of the saved asset that's written to the output path
 * @returns A promise that resolves to a Boolean which states whether the saved asset and the current
 * asset are the same.
 */
export async function compareAssetHashes(
  currentAsset: Asset,
  savedAssetHash: string | undefined
): Promise<boolean> {
  // Get the contents of the asset (flavor or variant) being processed
  const currContent = await currentAsset.getContents();
  // Compute the hash
  const currSourceHash = await createHash(currContent);
  return !!savedAssetHash && currSourceHash === savedAssetHash;
}
