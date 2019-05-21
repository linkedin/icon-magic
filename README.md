# icon-magic

Automated icon build system for iOS, Android and Web.

## Getting Started

Icon Magic is structured as a [Lerna](https://github.com/lerna/lerna) monorepo. All of Icon Magic's packages live in the `/packages/@icon-magic` directory.

In the root directory run:
- `yarn install`
- `yarn lerna run build`

or you can install lerna globally using `yarn global add lerna` and run `lerna` directly using `lerna run build`.

You can use `yarn lerna run` to run a script in each package that contains that script. i.e `yarn lerna run test` to run the tests for all packages. You'll need to run a build on all the packages when you switch branches.

## Glossary

- **Asset**: A single file containing a logo/image. Assets can be of multiple
  types .svg, .png, .webp
- **Variant**: a version of the icon that has its own underlying path elements.
  Variants are always of .svg type and form the input of the entire icon build
  process.
- **Icon**: The class representing a group of variants that belong to the same
  icon. For example, two variants of the home icon can be a filled version and
  an outline version of the same home icon. Within the file system, an icon is a
  directory that consists of all the variant assets and a corresponding
  iconrc.json config file.
- **iconrc.(js|json)** A config file for a single icon or a group of icons with
  paths to the various icon directories and their variants at minimum. The
  config further be caustomaized
- **Flavor**: An asset obtained after applying build/generate plugins on the
  source .svg file. A flavor will also contain assets for each type, i. e.,
  paths to the .svg, .png and .webp version of that flavor.

## Packages

Icon Magic is structured as a Lerna monorepo. All of Icon Magic's packages live in the `/packages/@icon-magic` directory. A brief description of its contents is as follows:

### @icon-magic/blueprint

A basic blueprint folder for an Icon Magic package. This module should never be published. Instead, it can be copied to another directory in `/packages/@icon-magic` (don't forget to re-name it in `package.json` too!) to create a new basic functioning module.

Most Icon Magic packages are built with Typescript, tested with Mocha, and linted with tslint using custom rules from `@icon-magic/code-style`.

### @icon-magic/code-style

Shared tslint config for all icon magic packages.

### @icon-magic/imagemin-farm

A process farm for image minification! Has two main methods exported:

#### minify(path: string): Promise\<Result>

Given a path to a `png`, `jpg`, or `webp` file, minify the file. File will be modified in-place and replaced with the minified version of the file. Spins up `os.cpus() - 1` child processes to minify files. Minification tasks are transparently load balanced between processes. Promise will resolve with a `Result` object of the shape:

```typescript
interface Result {
  path: 'path-to-file';
  worker: number; // Worker PID of completed task;
  status: {
    // Status across all tasks
    total: number; // Total tasks
    remaining: number; // Remaining tasks
    progress: number; // Task progress between 0 and 1.
    workers: [
      {
        pid: number; // Worker PID
        total: number; // Total tasks for worker
        remaining: number; // Remaining tasks for worker
        progress: number | null; // Task progress of worker between 0 and 1
      }
      // repeats for number of workers...
    ];
  };
}
```

#### subscribe(func: (res: ProcessStatus) => void): void

Subscribe a listener to recieve regular updates on process status. Good for updating progress bars. Recieves the `status` property of the `Results` object (defined above).

### @icon-magic/svg-to-png

Quickly converts an SVG file to a PNG file using Puppeteer. On process start, it spins up `os.cpus() - 1` independent browser instances to farm conversion tasks out across multiple processes. Exports two main methods:

#### async convertFile(fileName: string, options: SVGToPNGOptions): Promise<Buffer>

Given a path to a file, return the PNG buffer of the converted image.

#### async convert(contents: string, options: SVGToPNGOptions): Promise<Buffer>

Given the contents of a SVG file, return the PNG buffer of the converted image.

#### Options

Conversion options use the following interface:

```typescript
interface SVGToPNGOptions {
  width: number; // Width of the output PNG.
  height: number; // Height of the output PNG.
  headless?: boolean; // If the browser converting the image should be headless or not. Useful for debugging.
}
```

### @icon-magic/library

Type defenitions and type conversion primitives for an "icon bundle" (TODO: Rename this package to better reflect its contents).

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

The `pokemon` icon bundle contains one icon – [the `squirtle` icon](https://github.com/amiller-gh/icon-magic/tree/master/packages/%40icon-magic/library/test/fixtures/pokemon/squirtle).

The squirtle icon's `icon.json` file contains a list of all `Assets` associated with that icon. The source SVG files live alongside it.

The package's `iconToPNGs` method (TODO: method name is a mis-nomer, also generated webp...) will take a path to an icon bundle, and generate all assets required, at all sizes required, to generate final icon bundles for all supported platforms. Resulting image files are all minified. The library attempts to avoid duplicating work and will not render assets that are identical (ex: 12px asset at 2x and 24px asset at 1x), and always check on-disk to see if we can avoid rendering icons at all – PNG files have the SHA1 hash of its source SVG hidden in the file header to serve as a cache buster to enable incremental builds.

### TODO

- Split `Bundle` / `Icon` / `Asset` type definitions and filesystem ingestion from asset primitive generation. Move to independent packages.
- Create exporters for iOS, Android and Web. Takes primitives folder and moves to correct folder structure.
- Create icon bundle validator. Will all the metadata on Assets, we can determine if there are support gaps for a given icon – ex: no asset for 24px icon sizes, missing support for 2x screens, etc.
- Create API server for adding, modifying and removing icons from a bundle (Foundations for this live in `@icon-magic/server`.
- Create WYSIWYG manager for icon bundles – Drag and drop interface for managing
  icon bundles, icons and their assets. This uses the API server under the hood
  to modify assets. May be built as an Express middleware to interop nicely with
  `@icon-magic/server`.
