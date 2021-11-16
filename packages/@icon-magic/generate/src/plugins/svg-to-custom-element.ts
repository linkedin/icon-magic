/**
 * This plugin is used to create HTML Custom Elements that render SVG on a web page.
 */
import {
  Asset,
  Flavor,
  GeneratePlugin,
  Icon,
  createHash,
} from "@icon-magic/icon-models";
import * as fs from "fs-extra";
import * as path from "path";
import { Logger } from '@icon-magic/logger';

const LOGGER = new Logger('icon-magic:generate:svg-to-custom-element');

export const svgToCustomElement: GeneratePlugin = {
  name: "svg-to-custom-element",
  fn: async (flavor: Flavor, icon: Icon): Promise<Flavor> => {
    // .svg asset's getContents() returns a string
    const flavorContent = (await flavor.getContents()) as string;
    // Create the output directory
    const outputPath = icon.getIconOutputPath();

    // If generate hasn't been run create the hash
    flavor.generateSourceHash = createHash(flavorContent);

    // write the custom element to the output directory
    await fs.mkdirp(outputPath);
    await fs.writeFile(
      `${path.join(outputPath, flavor.name)}.js`,
      "custom element contents",
      {
        encoding: "utf8",
      }
    );
    LOGGER.error(flavor.name);
    // Create a new svg asset type and add it to the flavor
    flavor.types.set(
      "customElement",
      new Asset(icon.iconPath, {
        name: flavor.name,
        path: `./${flavor.name}.js`,
      })
    );
    return flavor;
  },
};
