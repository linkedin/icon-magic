# @icon-magic/library

**This package is not in use and is deprecated**

Type definitions and type conversion primitives for an "icon bundle" (TODO: Rename this package to better reflect its contents).

An icon `Bundle` is a named collection of icons:

```typescript
export interface Bundle {
  name: string;
  icons: Icon[];
}
```

Every `Icon` has a unique name, a path to its source directory, and a list of `Assets` that define its appearance under an array of conditions.

```typescript
export interface Icon {
  name: string;
  path: string;
  assets: Asset[];
}
```

Every `Asset` is defined as valid under a certain set of conditions (ex: screen resolution, platform, render size / size range, etc)

```typescript
export interface Asset {
  path: string;
  resolutions: number[];
  platforms: Platform[];
  sizes: AssetSize[];
}

export interface MaxMin {
  max: number;
  min: number;
}

export interface WidthHeight {
  width: number | MaxMin;
  height: number | MaxMin;
}

export type AssetSize = number | MaxMin | WidthHeight;
```

Icon bundles may be stored on disk using a serialized version of the `Icon` interface. For example, [here is the `pokemon` icon Bundle](https://github.com/amiller-gh/icon-magic/tree/master/packages/%40icon-magic/library/test/fixtures/pokemon).

The `pokemon` icon bundle contains one icon – [the `squirtle` icon](https://github.com/amiller-gh/icon-magic/tree/master/packages/%40icon-magic/library/test/fixtures/pokemon/squirtle).

The squirtle icon's `icon.json` file contains a list of all `Assets` associated with that icon. The source SVG files live alongside it.

The package's `iconToPNGs` method (TODO: method name is a mis-nomer, also generated webp...) will take a path to an icon bundle, and generate all assets required, at all sizes required, to generate final icon bundles for all supported platforms. Resulting image files are all minified. The library attempts to avoid duplicating work and will not render assets that are identical (ex: 12px asset at 2x and 24px asset at 1x), and always check on-disk to see if we can avoid rendering icons at all – PNG files have the SHA1 hash of its source SVG hidden in the file header to serve as a cache buster to enable incremental builds.