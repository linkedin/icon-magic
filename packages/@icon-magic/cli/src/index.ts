#!/usr/bin/env node

import { build } from '@icon-magic/build';
import { getIconConfigSet } from '@icon-magic/config-reader';
import { distributeByType } from '@icon-magic/distribute';
import * as iconGenerate from '@icon-magic/generate';
import { Logger, logger } from '@icon-magic/logger';

import * as program from 'commander';
import * as fs from 'fs-extra';

const LOGGER: Logger = logger('@icon-magic/cli/index');
const ICON_TYPES = ['svg', 'png', 'webp', 'all'];

program.version(getVersion(), '-v, --version');

program
  .command('build [inputPaths...]')
  .description(
    'construct flavors of an icon from its variants, after applying the build plugins.'
  )
  .action(async inputPaths => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic build .'?"
      );
      process.exit(1);
    }
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    // build all the icons
    await build(iconSet);

    // exit without any errors
    process.exit(0);
  });

program
  .command('generate [inputPaths...]')
  .description(
    'generates the flavors of the icon in the extension types that it can be consumed.'
  )
  .action(async inputPaths => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic generate .'?"
      );
      process.exit(1);
    }
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    // generate all the icons
    await iconGenerate.generateFromConfigHash(iconSet);

    // exit without any errors
    process.exit(0);
  });

program
  .command('distribute [inputPaths...]')
  .description(
    'moves an icon from the source to the destination, applying types as specified'
  )
  .option(
    '-o, --outputPath [outputPath]',
    'path to the output directory where the generated assets are to be written to'
  )
  .option(
    '-t, --type [type]',
    'type of icons format to handle, accepted types are svg|png|webp|all(default)'
  )
  .option(
    '-g, --groupBy [groupBy]',
    '[for web sprite creation] if to group the icons by category'
  )
  .action(async (inputPaths, options) => {
    if (!inputPaths.length) {
      LOGGER.error('No Input Directories were specified.\n');
      process.exit(1);
    }

    // throw an errof if outputPath isn't specified
    if (!options.outputPath) {
      LOGGER.error('Option --outputPath is required');
      process.exit(1);
    }

    // if there is no type specified, default to all
    if (!options.type) {
      options.type = 'all';
    }

    // else check that a valid type is passed in
    if (ICON_TYPES.indexOf(options.type) < 0) {
      LOGGER.error(
        'Option --type only supports "svg" | "png" | "webp" | "all"'
      );
      process.exit(1);
    }

    // only groupBy category is supported now
    if (options.groupBy && options.groupBy !== 'category') {
      LOGGER.error('Option --groupBy only supports "category"');
      process.exit(1);
    }

    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    // distribute the icons
    await distributeByType(
      iconSet,
      options.outputPath,
      options.type,
      options.groupBy === 'category'
    );

    // exit without any errors
    process.exit(0);
  });

// for all other commands or rather, no command and only arguments
program
  .command('* [inputPaths...]')
  .description('runs build and generate on all the inputPaths')
  .action(async inputPaths => {
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    // build all the icons
    const outputIconSet = await build(iconSet);

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

/**
 * Report the current version of this cli, based on package.json.
 */
function getVersion(): string {
  try {
    const pkgJson = fs.readJsonSync('./package.json');
    return pkgJson.version;
  } catch (e) {
    return 'UNKNOWN - Could not read package.json for icon-magic/cli';
  }
}
