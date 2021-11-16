import {
  GeneratePlugin,
  Icon,
  IconConfig,
  saveContentToFile
} from '@icon-magic/icon-models';
import {applyPluginOnAssets} from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';
import { existsSync } from 'fs-extra';
import * as workerpool from 'workerpool';

import { svgGenerate } from './plugins/svg-generate';
import { svgToRaster } from './plugins/svg-to-raster';
import { svgToCustomElement } from './plugins/svg-to-custom-element';

const LOGGER = new Logger('icon-magic:generate:index');

/**
 * generateSingleIcon transforms the set of .svg flavors of an icon to their
 * types by running a set of plugins based on the type in which we want the
 * output. For example, we can have a different set of plugins to obtain the
 * optimized svg and a different set to get a .png "type".
 *
 * After generate has applied all the plugins based on type, we now get flavors
 * with types that contain paths to the newly created .type asset. Generate also
 * updates the icon config with the newly generated types.
 *
 * If no plugins are passed for the type, then by default, svgToRaster is and
 * svgGenerate are applied on svg types
 * @param iconConfig mapping of the iconPath to the Icon class
 */
async function generateSingleIcon(
  iconConfig: IconConfig,
  hashing?: boolean
): Promise<void> {
  // TODO: this function should take in an instance of Icon but due to an issue
  // in workerpool, I'm using a workaround where we're having to create this
  // instance by taking an iconConfig instead.
  // Update when it is fixed. Refer to generate/index for more details
  const icon = new Icon(iconConfig, true);

  // if the icon does not contain a /build folder, prompt the user to to run
  // icon-magic build
  if (!existsSync(icon.getBuildOutputPath())) {
    LOGGER.error(
      `${icon.iconPath}: Run "icon-magic build" on the icon before running "generate"`
    );
  }
  const generateConfig = icon.generate;
  if (generateConfig) {
    for (const generateType of generateConfig && generateConfig.types) {
      switch (generateType.name) {
        case 'svg': {
          await applyGeneratePluginsOnFlavors(
            icon,
            generateType.plugins && generateType.plugins.length
              ? await getPlugins(generateType.plugins)
              : new Array(svgGenerate),
            new RegExp('svg'),
            hashing
          );
          break;
        }
        case 'raster': {
          await applyGeneratePluginsOnFlavors(
            icon,
            generateType.plugins && generateType.plugins.length
              ? await getPlugins(generateType.plugins)
              : new Array(svgToRaster),
            new RegExp('png|webp'),
            hashing
          );
          break;
        }
        case 'customElement': {
          await applyGeneratePluginsOnFlavors(
            icon,
            generateType.plugins && generateType.plugins.length
              ? await getPlugins(generateType.plugins)
              : new Array(svgToCustomElement),
            new RegExp('customElement'),
            hashing
          );
          break;
        }
        default: {
          // do nothing
          break;
        }
      }
    }
  }

  // write the icon config to disk
  LOGGER.debug(`Writing ${icon.iconName}'s iconrc.json to disk`);
  try {
    await saveContentToFile(
      icon.getIconOutputPath(),
      'iconrc',
      JSON.stringify(icon.getConfig(), null, 2),
      'json'
    );
  } catch (e) {
    LOGGER.error(`${e}`);
  }
}

/**
 * Iterates through the generate plugins declared and runs them sequentially on
 * all the flavors of the icon. The plugins are responsible for setting any new/updated
 * flavors created on the icon using `icon.flavors.set()`
 */
async function applyGeneratePluginsOnFlavors(
  icon: Icon,
  plugins: GeneratePlugin[],
  type: RegExp,
  hashing?: boolean
): Promise<boolean> {
  if (plugins.length) {
    for (const plugin of plugins) {
      LOGGER.debug(`Applying ${plugin.name} on ${icon.iconName}'s flavors`);
      // TODO: fork off a separate node process for each variant here
      await applyPluginOnAssets(icon, plugin, type, hashing || false);
    }
  }
  return Promise.resolve(true);
}

/**
 * Returns an instance of plugins all with the fn property
 * If the passed in plugin does not have fn defined on it, we attempt to find
 * the plugin within generate/plugins folder by matching the name
 * @param plugins Array of plugins to sanitize
 */
async function getPlugins(
  plugins: GeneratePlugin[]
): Promise<GeneratePlugin[]> {
  return await Promise.all(
    plugins.map(async plugin => {
      // if the plugin has a function, return the plugin
      if (typeof plugin.fn === 'function') return plugin;
      // import the plugin from ./plugins
      else {
        let pluginFromFile: GeneratePlugin;
        try {
          pluginFromFile = await import(`./plugins/${plugin.name}`);
          // override the plugin's data with the missing fn
          plugin.fn = pluginFromFile[`${kebabToCamel(plugin.name)}`].fn;
          return plugin;
        } catch (e) {
          throw e;
        }
      }
    })
  );
}

/**
 * Convert a string from kebab-case to camelCase
 * @param s string to convert to camel case
 */
function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}

workerpool.worker({ generateSingleIcon });
