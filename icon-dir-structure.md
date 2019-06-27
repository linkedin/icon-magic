# Setting up your icons for icon-magic

## Structuring your Icons Directory

At the core of `icon-magic` is the icon configuration `iconrc.(js|json)` which represents the icon. [@icon-magic/config-reader](packages/@icon-magic/config-reader) finds the closest config file(iconrc.json/iconrc.js/icon) to an icon to use for the build, generate and distribute processes.

```bash
  nav-icons
  ├── home
  │   ├── solid.svg
  │   └── color.svg
      computer
  │   ├── solid.svg
  │   └── color.svg
  ├── iconrc.json
```

You can define a single `iconrc` to apply to multiple icons. In the above case, the `iconrc.json` in `nav-icons` will apply to **both** the `home` icons and the `computer` icons.

The `iconrc.json` may look something like this with `iconPath` set to `*` which applies to all the files in the directory:

```json
{
  "iconPath": "*",
  "variants": [
    {
      "path": "./solid.svg"
    },
    {
      "path": "./color.svg"
    }
  ],
  "sizes": [16],
  "resolutions": [1]
}
```

Or you can define as many `iconrc`'s as you want to accomodate differences in how you want the icons to be processed.

```bash
  nav-icons
  ├── home
  │   ├── solid/solid.svg
  │   └── color/color.svg
  │   └── iconrc.json
  │   computer
  │   ├── solid.svg
  │   └── color.svg
  │   desktop
  │   ├── solid.svg
  │   └── color.svg
  ├── iconrc.json
```

In this case, the `iconrc` in `nav-icons` will apply to `computer` and `desktop` and the `iconrc` in the home directory will apply to just `home`. The `iconrc` for `home` will look like this with `iconPath` set to `.` which applies to all the files in the *current* directory::

```json
{
  "iconPath": ".",
  "variants": [
    {
      "path": "./solid/solid.svg"
    },
    {
      "path": "./color/color.svg"
    }
  ],
  "sizes": [24],
  "resolutions": [1]
}
```

to match it's corresponding folder structure.

## Icon configuration `iconrc.(js|json)`

You can explore all the available properties and descriptions on the Icon in the [TS config-schema](./packages/config-reader/src/schemas/config-schema) or [JSON Schema](./schema.md).
