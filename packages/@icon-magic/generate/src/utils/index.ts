import { loadConfigFile } from '@icon-magic/config-reader';
import {
  Flavor,
  FlavorConfig,
  compareAssetHashes
} from '@icon-magic/icon-models';
import * as path from 'path';

/**
 * Checks the config to see if the asset has been generated before i.e if it is
 * saved in the config flavors.
 * @param outputPath the output path of the icon, where the output of generate would
 * be written to.
 * @param flavorName the name of the asset currently being processed in generate
 * @param flavor the asset currently being processed in generate
 * @returns the config of the saved asset, if present
 */
export async function hasAssetBeenProcessed(
  outputPath: string,
  flavorName: string,
  flavor: Flavor
): Promise<FlavorConfig[] | null> {
  try {
    // Try and open the config file in the output path
    const iconrc = await loadConfigFile(path.join(outputPath, 'iconrc.json'));
    // Look for flavors in the config that matches the current flavor going through
    // the generation process
    const savedFlavorConfigs: FlavorConfig[] = iconrc
      ? iconrc['flavors'].filter((storedFlavor: Flavor) =>  {
        const regex = RegExp(`^${flavorName}\\b`);
        return regex.test(storedFlavor.name);
      }
        )
      : null;
    // None match, asset has not been processed before
    if (!savedFlavorConfigs.length) {
      return null;
    }

    // Flavors (webp, png, minified svg) with the same source svg already exists, no need to run generate again
    const allFlavorsMatch = savedFlavorConfigs.every(
      async (savedFlavorConfig: FlavorConfig) => {
        // Create new Flavor from the config we retrieved, so it's copied over
        // when the iconrc is written
        await compareAssetHashes(flavor, savedFlavorConfig.generateSourceHash);
      }
    );
    if (!allFlavorsMatch) {
      return null;
    }
    return savedFlavorConfigs;
  } catch (e) {
    // If we get here then the icon has not been generated before, we don't have to
    // do anything, just let it generate
    return null;
  }
}
