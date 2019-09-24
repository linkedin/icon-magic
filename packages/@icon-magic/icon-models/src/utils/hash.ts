import * as crypto from 'crypto';
import {
  Asset,
  Flavor,
} from '..';

export function createHash(contents: string|Buffer): string {
  return crypto
  .createHash('md5')
  .update(contents)
  .digest('hex');
}

export async function compareHash(currentAsset: Asset, savedAsset: Flavor): Promise<boolean> {
  // Get the contents of the asset (flavor or variant) being processed
  const currContent = await currentAsset.getContents();
  // Compute the hash
  const currSourceHash = createHash(currContent);
  return (!!savedAsset && currSourceHash === savedAsset.sourceHash);
}
