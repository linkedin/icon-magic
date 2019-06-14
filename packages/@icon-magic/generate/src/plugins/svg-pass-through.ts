import { Asset, Flavor, GeneratePlugin, Icon } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';

import { SvgGenerateOptions } from './svg-generate';

/**
 * Plugin that does not change the file but copies to the output directory
 */
export const svgPassThrough: GeneratePlugin = {
  name: 'svg-generate',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    _params: SvgGenerateOptions = {}
  ): Promise<Flavor> => {
    const outputPath = icon.getIconOutputPath();

    // write the optimized svg to the output directory
    await fs.mkdirp(outputPath);
    fs.copyFileSync(
      flavor.getPath(),
      `${path.join(outputPath, flavor.name)}.svg`
    );

    // Create a new svg asset type and add it to the flavor
    flavor.types.set(
      'svg',
      new Asset(icon.iconPath, {
        name: flavor.name,
        path: `./${flavor.name}.svg`
      })
    );
    return flavor;
  }
};
