import { IconConfigHash, IconSet } from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import * as path from 'path';
import * as workerpool from 'workerpool';

const LOGGER: Logger = logger('icon-magic:generate:index');
const pool = workerpool.pool(path.resolve(__dirname, './generate-worker.js'));

/**
 * Generate transorms the set of .svg flavors to their types by running a set of
 * plugins based on the type in which we want the output. For example, we can
 * have a different set of plugins to obtain the optimized svg and a different
 * set to get a .png "type".
 *
 * generate-worker.js is used to paralellize the generation of icons using a
 * workerpool
 *
 * @param iconSet mapping of the iconPath to the Icon class
 */
export async function generate(iconSet: IconSet): Promise<void> {
  LOGGER.debug('Icon generation has begun');

  LOGGER.debug('Creating the worker pool');
  const poolPromises: any[] = [];

  // runs the plugins on each icon using the pool
  for (const icon of iconSet.hash.values()) {
    poolPromises.push(
      // TODO: workerpool has a bug with passing in a class instace as a
      // parameter to pool.exec params. Hence we're passing the icon.getConfig()
      // and then constructing the Icon class within the worker. Not ideal, but
      // I'll file a bug and follow up with them on it. TODO: Create an issue
      // for workerpool
      pool.exec('generateSingleIcon', [
        Object.assign(icon.getConfig(), { iconPath: icon.iconPath })
      ])
    );
  }
  await Promise.all(poolPromises).then(async () => {
    if (poolPromises.length > 0) {
      await pool.terminate();
    }
  });
}

/**
 * This is a wrapper around the generate() function above that takes in an
 * iconConfigHash instead of an iconset. It can be used to invoke generate()
 * directly from the CLI
 */
export async function generateFromConfigHash(
  iconConfig: IconConfigHash
): Promise<void> {
  const iconSet = new IconSet(iconConfig, true);
  return generate(iconSet);
}
