# @icon-magic/config-reader

This module is responsible for finding the closest config
file(iconrc.json/iconrc.js/icon) to an icon and resolving all the paths in the
config file so it's relative to the icon bundle. It helps in

- Locating config files within directories
- Provides utils to read, validate and write icon config files
- Defining and managing the data for each icon
- Managing the config data for a set of icons in memory via a hash

## Interface

### getIconConfigSet(inputPaths: string[]): IconConfigHash

This is the primary method that the bundle exposes and is responsible for taking
a set of input paths and constructing a map of the path to the icon and it's
corresponding config JSON that should, entirely represent the characteristics of
the icon. It validates the structure of all the configs as well.

An example input iconrc.json looks like this. Refer to
@icon-magic/config-reader/schemas/config-schema for a detailed description of
the various fields

```typescript
{
  "iconPath": "*",
  "variants": [
    {
      "path": "./filled.svg"
    },
    {
      "name": "someOtherName",
      "path": "./outline.svg"
    }
  ],
  "sizes": [24],
  "resolutions": [1],
  "build": {
    "outputPath": "./out"
  },
  "generate": {
    "outputPath": "./out",
    "types": [
      {
        "name": "svg",
        "plugins": []
      },
      {
        "name": "raster",
        "plugins": []
      }
    ]
  }
}

```

For more details on the interfaces, refer to @icon-magic/icon-models
