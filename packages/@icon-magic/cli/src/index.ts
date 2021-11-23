#!/usr/bin/env node

import { build } from '@icon-magic/build';
import { getIconConfigSet } from '@icon-magic/config-reader';
import { distributeByType } from '@icon-magic/distribute';
import * as iconGenerate from '@icon-magic/generate';
import { Logger } from '@icon-magic/logger';
import * as program from 'commander';
import * as fs from 'fs-extra';

const LOGGER = new Logger('@icon-magic/cli/index');
const ICON_TYPES = ['svg', 'png', 'webp', 'all'];

program.version(getVersion(), '-v, --version');

program
  .command('build [inputPaths...]')
  .description(
    'construct flavors of an icon from its variants, after applying the build plugins.'
  )
  .option(
    '-nc, --noCache',
    'When set, turns off caching and builds all the icon variants whether or not the source has been updated from the previous execution'
  )
  .option(
    '-d, --debug', 'Default is false.  When true, will log debugging info to the command-line'
  )
  .action(async (inputPaths, options) => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic build .'?"
      );
      process.exit(1);
    }
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    //set the debugState on the Logger Class using the commander flag
    LOGGER.setDebug(options.debug);

    // build all the icons
    await build(iconSet, !options.noCache);

    // exit without any errors
    process.exit(0);
  });

program
  .command('generate [inputPaths...]')
  .description(
    'generates the flavors of the icon in the extension types that it can be consumed.'
  )
  .option(
    '-nc, --noCache',
    'When set, turns off caching and generates all the icon variants whether or not the source has been updated from the previous execution'
  )
  .option(
    '-d, --debug', 'Default is false.  When true, will log debugging info to the command-line'
  )
  .action(async (inputPaths, options) => {
    if (!inputPaths.length) {
      LOGGER.error(
        "No Input Directories were specified.\nDid you mean 'icon-magic generate .'?"
      );
      process.exit(1);
    }
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    //set the debugState on the Logger Class using the commander flag
    LOGGER.setDebug(options.debug);

    // generate all the icons
    await iconGenerate.generateFromConfigHash(iconSet, !options.noCache);

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
    '[required] path to the output directory where the generated assets are to be written to'
  )
  .option(
    '-t, --type [type]',
    'type of icons format to handle, accepted types are svg|png|webp|all(default)'
  )
  .option(
    '-g, --groupBy [groupBy]',
    '[for web] how to group the icons. The only available option for now is `--groupBy category`. \n For sprites, icons are grouped with <defs> tags with IDs matching the category and for non-sprites \n this distributes svgs in folder matching the category.'
  )
  .option(
    '-hbs, --outputAsTemplate',
    '[for web] whether to output the svg as handlebars template.'
  )
  .option(
    '-d, --debug', 'Default is false.  When true, will log debugging info to the command-line'
  )
  .option(
    '-c, --colorScheme <colorScheme...>', 'With no flag, `light` and `dark` colorSchemes are distributed. Other colorSchemes can be specified with flag'
  )
  .option(
    '-i, --withEmbeddedImage', '[for web] Filters only those assets with embedded images with them'
  )
  .option(
    '-s, --doNotRemoveSuffix', 'When used with --outputAsTemplate, will NOT trim the "-mixed" suffix on the file name'
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

    // --doNotRemoveSuffix is only for --outputAsTemplate flag
    if (options.doNotRemoveSuffix && !options.outputAsTemplate) {
      LOGGER.error('Option --doNotRemoveSuffix must be used with --outputAsTemplate flag');
      process.exit(1);
    }

    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    //set the debugState on the Logger Class using the commander flag
    LOGGER.setDebug(options.debug);

    // distribute the icons
    await distributeByType(
      iconSet,
      options.outputPath,
      options.type,
      options.groupBy === 'category',
      options.outputAsTemplate,
      options.colorScheme,
      options.withEmbeddedImage,
      options.doNotRemoveSuffix
    );

    // exit without any errors
    process.exit(0);
  });

// for all other commands or rather, no command and only arguments
program
  .command('* [inputPaths...]', { isDefault: true })
  .description('runs build and generate on all the inputPaths')
  .option(
    '-nc, --noCache',
    'When set, turns off caching and builds and generates all the icon variants whether or not the source has been updated from the previous execution'
  )
  .option(
    '-d, --debug', 'Default is false.  When true, will log debugging info to the command-line'
  )
  .action(async (inputPaths, options) => {
    // Get the iconSet from the inputPaths
    const iconSet = getIconConfigSet(inputPaths);

    //set the debugState on the Logger Class using the commander flag
    LOGGER.setDebug(options.debug);

    // build all the icons
    const outputIconSet = await build(iconSet, !options.noCache);

    // generate all the icons
    await iconGenerate.generate(outputIconSet, !options.noCache);

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
