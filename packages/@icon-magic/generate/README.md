# @icon-magic/generate

This package is responsible for generating the flavors of the icon in all the
different types in which it can be consumed. At the end of the build step, we
have each flavor in it's .svg format, but after generate, we will have more
optimized `.svg` and `.js` files, `.png` files that can be consumed by iOS, and `.webp` files that
can be consumed by android.

Generate transforms the set of `.svg` flavors to their types by running a set of
plugins based on the type in which we want the output. For example, we can have
a different set of plugins to obtain the optimized svg and a different set to
get a `.png` "type".

After generate has applied all the plugins based on type, we now get flavors
with types that contain paths to the newly created .type asset. Generate also
updates the icon config with the newly generated types. An example flavor in the
icon config (iconrc.json) after it's been through the generate step will look like
this:

```typescript
{
    "name": "filled-24x24",
    "path": "./filled.svg",
    "types": {
        "png": {
            "name": "filled-24x24",
            "path": "./filled-24x24.png"
        },
        "webp": {
            "name": "filled-24x24",
            "path": "./filled-24x24.webp"
        }
    }
},
```

## Interface

### generate(iconSet: IconSet): Promise<void>

This package's primary interface is the generate function that takes in a
mapping of the path to the icon directory and the Icon class corresponding to
the icon. This allows it to be chained to the build step in the following
manner:

```typescript
// build all the icons
let outputIconSet = await iconBuild.build(iconSet);
// generate all the icons
await iconGenerate.generate(outputIconSet);
```

All the while, the icon in memory is updated with the newly generated types for
each flavor. After all the plugins are applied, the generate then writes the
config of each icon to form an icon bundle consisting of:

1. The icon config file (iconrc.json) with flavors and types
2. The various flavors of the icon in their optimized `.svg` and `.js` version
3. The various flavors of the icon in their `.png` and `.webp` version

```bash
outputIconSet
├── home
│   ├── filled-24x24.png
│   ├── filled-24x24.webp
│   ├── filled.js
│   ├── filled.svg
│   ├── iconrc.json
│   ├── someOtherName-24x24.png
│   ├── someOtherName-24x24.webp
│   └── someOtherName.js
│   └── someOtherName.svg
└── modified-small-home
    ├── filled-16x16.png
    ├── filled-16x16.webp
    ├── filled-32x32.png
    ├── filled-32x32.webp
    ├── filled-8x8.png
    ├── filled-8x8.webp
    ├── filled.js
    ├── filled.svg
    ├── iconrc.json
    ├── modifiedOutline-16x16.png
    ├── modifiedOutline-16x16.webp
    ├── modifiedOutline-32x32.png
    ├── modifiedOutline-32x32.webp
    ├── modifiedOutline-8x8.png
    ├── modifiedOutline-8x8.webp
    └── modifiedOutline.js
    └── modifiedOutline.svg
```

### generate/plugins

Generate, by default provides the following plugins

#### svg-to-raster

That is used for generating PNG and webP assets. This plugin uses
@icon-magic/svg-to-png and @icon-magic/image-min farm to generate `.png` and `.webp`
assets and minify the outputs.

### svg-generate - svgOptimize

That is used to clean up the `.svg` file from unnecessary nodes, attributes and
metatadata.

#### svg-to-custom-element

This plugin converts `.svg` to `.js` that contain [HTML Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to render the given SVG on a web page. The resulting assets define and register custom elements to CustomElementRegistry via `window.customElements`. The input of this plugin is the svg to be converted to custom element. The plugin returns the asset flavor with added custom element asset type and automatically writes the output (javascript files) to the output directory.

For more details on the interfaces, refer to [@icon-magic/icon-models](https://github.com/linkedin/icon-magic/tree/master/packages/%40icon-magic/icon-models).
