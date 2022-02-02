import { Asset, Flavor, FlavorType, Icon } from '@icon-magic/icon-models';

/**
 * The resolution of an asset is within the assets name as "@resolution"
 * This function matches the name against different resolutions and returns the
 * appropriate scale or resolution
 * @param asset the asset whose resolution needs to be determined
 * @param getAsScale Boolean for returning the scale instead of the resolution
 * @returns either the resolution or scale depending on the boolean getAsScale
 */
export function getAssetResolutionFromName(
  asset: Asset,
  getAsScale?: Boolean,
  rtlFlip?: Boolean
): string {
  let resolution;
  let scale;
  switch (true) {
    case /@1.5/.test(asset.name): {
      resolution = rtlFlip ? 'drawable-ldrtl-hdpi' : 'drawable-hdpi';
      scale = '1.5x';
      break;
    }
    case /@1/.test(asset.name): {
      resolution = rtlFlip ? 'drawable-ldrtl-mdpi' : 'drawable-mdpi';
      scale = '1x';
      break;
    }
    case /@2/.test(asset.name): {
      resolution = rtlFlip ? 'drawable-ldrtl-xhdpi' : 'drawable-xhdpi';
      scale = '2x';
      break;
    }
    case /@3/.test(asset.name): {
      resolution = rtlFlip ? 'drawable-ldrtl-xxhdpi' : 'drawable-xxhdpi';
      scale = '3x';
      break;
    }
    default: {
      resolution = rtlFlip ? 'drawable-ldrtl-xxxhdpi' : 'drawable-xxxhdpi';
      scale = '4x';
      break;
    }
  }
  return getAsScale ? scale : resolution;
}

/**
 * Every icon has a set of flavors and each flavor can have one or more types.
 * This function returns those flavors that contain a certain type
 * @param icon Icon whose flavors are to be returned
 * @param type The type to which to filter the icon's flavors by
 * @returns a list of flavors that contain assets of "type"
 */
export function getIconFlavorsByType(icon: Icon, type: FlavorType): Asset[] {
  return Array.from(icon.flavors.values())
    .filter((flavor: Flavor) => {
      return flavor.types.has(type);
    })
    .map((flavor: Flavor) => flavor.types.get(type) as Asset); // type casting here as we have checked for whether the flavor has the type above
}

/**
 * Strips resolution from icon name
 * @param iconName name to strip resolution from
 * @returns a string with the resolution stripped
 */
export function removeResolutionFromName(iconName: string): string {
  return iconName.includes('@') ? iconName.replace(/(-)?@[0-9](.[0-9])?/, '') : iconName;
}

/**
 * Compares two strings
 * @param nameOne string to compare
 * @param nameTwo string to compare
 * @returns a number from which strings will be sorted against
 */
export function compareStrings(nameOne: string, nameTwo: string): number {
  if (nameOne < nameTwo) {
    return -1;
  }
  if (nameOne > nameTwo) {
    return 1;
  }
  return 0;
}

/**
 * Convert a string from kebab-case to camelCase
 * @param s string to convert to camel case
 */
 export function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}