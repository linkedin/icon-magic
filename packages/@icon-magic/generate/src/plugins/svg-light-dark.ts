/*
- This plugin will create a master svg with two child svg's.
- One dark and one light.
- The children svgs will have a `display` attribute that can be used to set
which of the two svg's will be visible. */

import {
  Flavor,
  GeneratePlugin,
  Icon
} from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
// import Svgo from 'svgo';

export interface SvgLightDarkOptions {
  lightToken?: string;
  darkToken?: string;
}

export const svgLightDark: GeneratePlugin = {
  name: 'svg-light-dark',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    // params: SvgLightDarkOptions = {},
  ): Promise<Flavor> => {
    // const flavorContent = (await flavor.getContents()) as string; // .svg asset's getContents() returns a string (the svg as a string)
    // const flavorName: string = path.basename(flavor.name);
    // Create the output directory
    const outputPath = icon.getIconOutputPath();
    const imageSet = flavor.imageset;
    // let testFlavor = icon.flavors.get("accent-1-on-dark");
    // let testImageSet;
    // let testColorScheme;

    // if (testFlavor) {
    //   testImageSet = testFlavor.imageset;
    //   testColorScheme = testFlavor.colorScheme;
    // }




    if (imageSet) {
      // let lightIcon = icon.getConfig().flavors?.find(flv => flv["name"] === imageSet);

      await fs.ensureDir(outputPath);
      await fs.writeFile(
        `${path.join(outputPath, flavor.name)}-YES-image-set.svg`,
        flavor.name,
        {
          encoding: 'utf8'
        }
      );
    // const lightToken = params.lightToken;
    // const darkToken = params.darkToken;


    // const lightSvgo = new Svgo({
    //   plugins: [
    //     {
    //       addAttributesToSVGElement: {
    //         attributes: [{display: lightToken}]
    //       }
    //     }
    //   ],
    //   js2svg: { pretty: true, indent: 2 }
    // });

    // const darkSvgo = new Svgo({
    //   plugins: [
    //     {
    //       addAttributesToSVGElement: {
    //         attributes: [{display: darkToken}]
    //       }
    //     }
    //   ],
    //   js2svg: { pretty: true, indent: 2 }
    // });

        // write the optimized svg to the output directory
        // const lightAsset = await lightSvgo.optimize(flavorContent); //returns a string
        // const darkAsset = await darkSvgo.optimize(flavorContent);

        // await fs.ensureDir(outputPath);
        // await fs.writeFile(
        //   `${path.join(outputPath, flavor.name)}-${imageSet}-mixed.svg`,
        //   lightAsset.data,
        //   {
        //     encoding: 'utf8'
        //   }
        // );
        // await fs.writeFile(
        //   `${path.join(outputPath, flavor.name)}-${imageSet}-mixed-dark.svg`,
        //   "test",
        //   {
        //     encoding: 'utf8'
        //   }
        // );
    } else {
      await fs.ensureDir(outputPath);
      await fs.writeFile(
        `${path.join(outputPath, flavor.name)}-NO-image-set.svg`,
        flavor.name,
        {
          encoding: 'utf8'
        }
      );
    }
    await fs.ensureDir(outputPath);
    await fs.writeFile(
      `${path.join(outputPath, flavor.name)}-ALL-light-dark.svg`,
      icon.iconName,
      {
        encoding: 'utf8'
      }
    );
    return flavor;
  }
};
