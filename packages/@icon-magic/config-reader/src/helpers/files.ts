import { Flavor, FlavorConfig, Icon } from '@icon-magic/icon-models';
import { readFileSync } from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';

import { loadConfigFile } from '..';

import { createHash } from './hash';


export function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
}

export function exists(path: string): boolean {
  return fs.existsSync(path);
}

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
  icon: Icon,
  outputPath: string,
  flavorName: string,
  flavor: Flavor,
  type: RegExp
): Promise<FlavorConfig[] | null> {
  try {
    // Try and open the config file in the output path
    const iconrc = await loadConfigFile(path.join(outputPath, 'iconrc.json'));
    if (iconrc) {
      // Look for flavors in the config that matches the current flavor going through
      // the generation process
      const savedFlavorConfigs: FlavorConfig[] = iconrc['flavors'].filter(
        (storedFlavor: Flavor) => {
          // does the flavor name match
          const doesFlavorNameMatch = RegExp(`^${flavorName}\\b`).test(
            storedFlavor.name
          );
          const doFlavorTypesMatch = Object.keys(storedFlavor.types).every(
            flavType => {
              return flavType.match(type);
            }
          );
          return doesFlavorNameMatch && doFlavorTypesMatch;
        }
      );
      if (savedFlavorConfigs.length) {
        // Check if all the flavors in the config have hashes that match
        // the current flavor we are looking at
        let allFlavorsMatch = false;
        for (const config of savedFlavorConfigs) {
          // Check source (build output)
          const buildOutputPath = path.resolve(icon.getBuildOutputPath(), `${flavor.name}.svg`);
          const flavorContent = readFileSync(buildOutputPath, 'utf8');
          allFlavorsMatch = await compareAssetHashes(
            createHash(flavorContent),
            config.generateSourceHash
          );
          if (!allFlavorsMatch) {
            break;
          }
        }
        // Flavors (webp, png, minified svg) with the same source svg already exists, no need to run generate again
        if (allFlavorsMatch) {
          return savedFlavorConfigs;
        }
      }
    }
  } catch (e) {
    // If we get here then the icon has not been generated before, we don't have to
    // do anything, just let it generate
    return null;
  }
  return null;
}

/**
 * Checks if the `sourceHash` of the saved asset matches the computed hash of
 * the asset that's about to be taken through the generation process.
 * @param currentAssetHash the hash of asset being processed in the generate step
 * @param savedAssetHash the hash of the saved asset that's written to the output path
 * @returns A promise that resolves to a Boolean which states whether the saved asset and the current
 * asset are the same.
 */
async function compareAssetHashes(
  currentAssetHash: string | undefined,
  savedAssetHash: string | undefined
): Promise<boolean> {
  return !!savedAssetHash && currentAssetHash === savedAssetHash;
}
