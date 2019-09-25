import { loadConfigFile } from '@icon-magic/config-reader';
import * as path from 'path';
import { Flavor, createHash, Asset } from '@icon-magic/icon-models';

/**
 * Checks if the `sourceHash` of the saved asset matches the computed hash of
 * the asset that's about to be taken through the generation process.
 * @param currentAsset the asset being processed in the generate step
 * @param savedAsset the asset saved in the config that's written to the output path
 * @returns A promise that resolves to a Boolean which states whether the saved asset and the current
 * asset are the same.
 */
export async function compareAssetHashes(
  currentAsset: Asset,
  savedAsset: Flavor
): Promise<boolean> {
  // Get the contents of the asset (flavor or variant) being processed
  const currContent = await currentAsset.getContents();
  // Compute the hash
  const currSourceHash = createHash(currContent);
  return currSourceHash === savedAsset.sourceHash;
}

/**
 * Checks the config to see if the asset has been generated before i.e if it is
 * saved in the config flavors.
 * @param outputPath the output path of the icon, where the output of generate would
 * be written to.
 * @param flavorName the name of the asset currently being processed in generate
 * @param flavor the asset currently being processed in generate
 * @returns
 */
export async function hasAssetBeenProcessed(
  outputPath: string,
  flavorName: string,
  flavor: Flavor
): Promise<Boolean> {
  try {
    // Try and open the config file in the output path
    const iconrc = await loadConfigFile(path.join(outputPath, 'iconrc.json'));
    // Look for a flavor in the config that matches the current flavor going through
    // the generation process
    const savedFlavor: Flavor = iconrc
      ? iconrc['flavors'].find(
          (storedFlavor: Flavor) => storedFlavor.name === flavorName
        )
      : null;
    // Flavor with the same source svg already exists, no need to run generate again
    if (savedFlavor) {
      return await compareAssetHashes(flavor, savedFlavor);
    }
  } catch (e) {
    // If we get here then the icon has not been generated before, we don't have to
    // do anything, just let it generate
    return false;
  }
  return false;
}
