import { Asset, FlavorType, Icon } from '@icon-magic/icon-models';

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
  getAsScale?: Boolean
): string {
  let resolution;
  let scale;
  switch (true) {
    case /@1.5/.test(asset.name): {
      resolution = 'drawable-mdpi';
      scale = '1.5x';
      break;
    }
    case /@1/.test(asset.name): {
      resolution = 'drawable-hdpi';
      scale = '1x';
      break;
    }
    case /@2/.test(asset.name): {
      resolution = 'drawable-xhdpi';
      scale = '2x';
      break;
    }
    case /@3/.test(asset.name): {
      resolution = 'drawable-xxhdpi';
      scale = '3x';
      break;
    }
    default: {
      resolution = 'drawable-xxxhdpi';
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
    .filter(flavor => {
      return flavor.types.has(type);
    })
    .map(flavor => flavor.types.get(type) as Asset); // type casting here as we have checked for whether the flavor has the type above
}

/**
 * Strips resolution from icon name
 * @param iconName name to strip resolution from
 * @returns a string with the resolution stripped
 */
export function removeResolutionFromName(iconName: string): string {
  return iconName.includes('@') ? iconName.replace(/@[0-9]/, '') : iconName;
}
