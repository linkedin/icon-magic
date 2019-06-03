# @icon-magic/distribute

This package is responsible for massaging the assets into type specific structures and formats. At the end of the `generate` step, we have optimized .svg files, .png files and .webp files for web, ios and android consumption. You can look in [test/fixtures/input](./test/fixtures/input) for an example of the file structure after the generate step. `distribute` organizes and structures those files how they need to be consumed and creates the necessary files for platform consumption.

## Interface

### `distributeByType(iconConfig: IconConfigHash, outputPath: string, type: ICON_TYPES, groupByCategory = true): Promise<void>`

This package's primary interface is the `distributeByType` function that takes in a set of icons to be moved to the output folder, the type of icon to distribute (`'svg' | 'png' | 'webp'`), the output path the icons should be moved to and whether (for sprite creation), the icons should be grouped by their category attribute.

```typescript
// Get the iconSet from the inputPaths
const iconSet = configReader.getIconConfigSet(new Array(i));

// distribute the icons
await distributeByType(iconSet, o, t, g);
```

For each type (`'svg' | 'png' | 'webp'`) `distributeByType` calls a function to massage the asset counterparts. By default type is set to 'all' which means it calls the functions for all types.

### Output of `distributeByType`

#### type="svg"

For web use, `distribute` can move the svg assets to the output _and / or_ create a sprite with icons appended.

```bash
out
├── `${iconName}` e.g `filled`
│   ├── filled.svg
├── icons.svg
```

You can indicate whether an icon should be included in a sprite and the sprite name through the icon's `iconrc.json`:

```json
  "distribute": {
    "svg": {
      "toSprite": true,
      "spriteName": "icons"
    }
  }
```

You can also add a `category` attribute to the `iconrc.json` which will be used to group the icons in the sprite (using `<defs>` with the ID attribute set to the value of `category`)

```json
  "category": "ui-icon",
  "distribute": {
    "svg": {
      "toSprite": true,
      "spriteName": "icons"
    }
  }
```

e.g `icons.svg`:

```xml
<svg>
  <defs id="ui-icon">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled-1" data-supported-dps="8x8 16x16" fill="currentColor">
      <path d="M28 13.36L16.64 6.19a1.2 1.2 0 0 0-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 0 0 1 1h6v-5h4v5h6a1 1 0 0 0 1-1V13.67L27 15z"/>
    </svg>
  </defs>
</svg>
```

#### type="webp"

```bash
out
├── drawable-xxxhdpi `folder name depends on asset resolution`
│   ├── filled-1_filled-24x12@2.webp
│   └── filled-1_filled-60x60@2.webp
│   └── filled-1_filled-60x60@2.webp
```

#### type="png"

```bash
out
├── `${iconName}_${flavor.name}.imageset` e.g `filled-1_filled-24x12.imageset`
│   ├── Contents.json
│   └── `${iconName}_${flavor.name}.png` e.g `filled-1_filled-24x12@2.png`
```
