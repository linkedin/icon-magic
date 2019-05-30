#!/usr/bin/env node

import * as iconBuild from '@icon-magic/build';
import * as configReader from '@icon-magic/config-reader';
import * as iconGenerate from '@icon-magic/generate';
import { distributeByType } from '@icon-magic/distribute';

import { Logger, logger } from '@icon-magic/logger';
import * as program from 'commander';

const LOGGER: Logger = logger('@icon-magic/cli/index');
type ICON_TYPES = 'svg' | 'png' | 'webp' | 'all';

program
  .command(
    'build [inputPaths...]',
    'construct flavors of an icon from its variants, after applying the build plugins.'
  )
  .action(async inputPaths => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic build .'?"
      );
    }
    // Get the iconSet from the inputPaths
    const iconSet = configReader.getIconConfigSet(inputPaths);

    // build all the icons
    await iconBuild.build(iconSet);

    // exit without any errors
    process.exit(0);
  });

program
  .command(
    'generate [inputPaths...]',
    'generates the flavors of the icon in the extension types that it can be consumed.'
  )
  .action(async inputPaths => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic generate .'?"
      );
    }
    // Get the iconSet from the inputPaths
    const iconSet = configReader.getIconConfigSet(inputPaths);

    // generate all the icons
    await iconGenerate.generateFromConfigHash(iconSet);

    // exit without any errors
    process.exit(0);
  });

program
  .command(
    'distribute',
    'moves an icon from the source to the destination, applying types as specified'
  )
  .option('-i, --inputPaths', 'path to the input directory of icons')
  .option(
    '-o, --outputPath',
    'path to the output directory where the generated assets are to be written to'
  )
  .option(
    '-t, --type',
    'type of icons format to handle, accepted types are svg|png|webp'
  )
  .option(
    '-g, --groupByCategory',
    '[for web sprite creation] if to group the icons by category'
  )
  .action(async (i: string, o: string, t: ICON_TYPES, g: boolean) => {
    if (!i.length) {
      LOGGER.error('No Input Directories were specified.\n');
    }
    // Get the iconSet from the inputPaths
    const iconSet = configReader.getIconConfigSet(new Array(i));

    // distribute the icons
    await distributeByType(iconSet, o, t, g);

    // exit without any errors
    process.exit(0);
  });

// for all other commands or rather, no command and only arguments
program
  .command('* [inputPaths...]', 'runs build and generate on all the inputPaths')
  .action(async inputPaths => {
    // Get the iconSet from the inputPaths
    const iconSet = configReader.getIconConfigSet(inputPaths);

    // build all the icons
    const outputIconSet = await iconBuild.build(iconSet);

    // generate all the icons
    await iconGenerate.generate(outputIconSet);

    // exit without any errors
    process.exit(0);
  });

program.parse(process.argv);

// when there are no commands or arguments
if (program.args.length < 1) {
  program.outputHelp();
  process.exit(0);
}
