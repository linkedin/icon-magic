# @icon-magic/build

The build is responsible for constructing all the various flavors that an icon
can exist in from it's different variants, after applying the build plugins on
the variants. It moves these resulting flavors to the destination folder
renaming the icon if necessary. It also generates a config file, one for each
icon and stores it along with the icon it's in output folder.

Build transforms the variants into flavors by applying all the build plugins on
each variant of each icon. Plugins are applied in the order in which they
appear. This will result in different flavors of the icon, which are added to
the icons config. @param iconConfig a map of the iconPaths to it's config json

## Interface

### build(iconConfig: IconConfigHash): Promise<IconSet>

The build function that takes in a mapping of the path to the icon directory and
a configuration of the icon itself. For example, we contain a directory (as
below) for `nav-icons` (navigation icons). This directory contains one icon, the
`home` icon which has two variants - `filled.svg` and `outline.svg`.

```bash
nav-icons
├── home
│   ├── filled.svg
│   └── outline.svg
├── iconrc.json
```

`nav-icons` also contains an `iconrc.json` that is applicable to all the icons
within `nav-icons` including the `home` icon. After we get the config from
`config-reader`'s `getIconConfigSet()`, each Icon will have it's own config with
resolved iconPaths as below:

```typescript
[
  '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/home',
  {
    iconPath:
      '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/home',
    variants: [
      { path: './filled.svg' },
      { name: 'someOtherName', path: './outline.svg' }
    ],
    build: { outputPath: './out' },
    sourceConfigFile:
      '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/iconrc.json'
  }
];
```

With this input set of icons, build creates Icon classes in memory and then goes
on to apply all the build plugins on each variant of the icon, transforming it
into one or multiple flavors and writing the resulting flavors into the output.
All the while, the icon in memory is updated with the newly generated flavors.
After all the plugins are applied, the build then writes the config of each icon
to form an icon bundle consisting of

1. The icon config file (iconrc.json)
2. The various flavors of the icon in their svg formats

build() then returns a Map of the path to the icon directory and it's
corresponding Icon class so it can be chained to the next steps of the icon
generation process

### build/plugins

Currently, we don't have any default build plugins but these are an ideal place
to add css classes on the .svg icon for to generate different color themes of
the icon. All .svg manipulations to generate flavors are done as part of the
build process via build plugins

For more details on the interfaces, refer to @icon-magic/icon-models
