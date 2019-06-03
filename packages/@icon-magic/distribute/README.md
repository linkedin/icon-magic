# @icon-magic/distribute

This package is responsible for massaging the assets into type specific structures and formats.
At the end of the generate step, we have optimized .svg files, .png files and .webp files for web,
ios and android consumption. You can look in `test/fixtures/input` for an example of the file structure
after the generate step. `Distribute` organizes and structures those files how they need to be consumed
and creates the necessary files for platform consumption.

## Interface

### distributeByType(iconConfig: IconConfigHash, outputPath: string, type: ICON_TYPES, groupByCategory = true): Promise<void>

This package's primary interface is the `distributeByType` function that takes in a
set of icons to be moved to the output folder, the type of icon to distribute
(`'svg' | 'png' | 'webp'`), the outputPath the icons should be moved to and whether
(for sprite creation), the icons should be grouped by their category attribute.

```typescript
// Get the iconSet from the inputPaths
const iconSet = configReader.getIconConfigSet(new Array(i));

// distribute the icons
await distributeByType(iconSet, o, t, g);
```

For each type (`'svg' | 'png' | 'webp'`) it calls a function to massage the asset counterparts. By default,type is set to 'all' which means it calls the functions for all types.

### type="svg"

For web use, `distribute` can move the svg assets to the output _and / or_
create a sprite with icons appended.

```bash
out
├── `${iconName}` e.g `filled`
│   ├── filled.svg
├── icons.svg
```

Sprite creation happens by default and you can indicate whether an icon should
be included in a sprite through the icon's `iconrc.json`:

```json
  "distribute": {
    "svg": {
      "toSprite": true, // will be included in sprite
      "spriteName": "icons" // name of sprite file
    }
  }
```

You can also add a `category` attribute to the `iconrc.json` which will be used
to group the icons in the sprite (using `<defs>` with the ID attribute set to the value of `category`)

```json
  "category": "ui-icon",
  "distribute": {
    "svg": {
      "toSprite": true, // will be included in sprite
      "spriteName": "icons" // name of sprite file
    }
  }
```

### type="webp"

```bash
out
├── drawable-xxxhdpi `folder name depends on asset resolution`
│   ├── filled-1_filled-24x12@2.webp
│   └── filled-1_filled-60x60@2.webp
│   └── filled-1_filled-60x60@2.webp
```

### type="png"

```bash
out
├── `${iconName}_${flavor.name}.imageset` e.g `filled-1_filled-24x12.imageset`
│   ├── Contents.json
│   └── `${iconName}_${flavor.name}.png` e.g `filled-1_filled-24x12@2.png`
```
