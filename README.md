# icon-magic

Automated icon build system for iOS, Android and Web.

## Getting Started

Icon Magic is structured as a [Lerna](https://github.com/lerna/lerna) monorepo. All of Icon Magic's packages live in the `/packages/@icon-magic` directory and you'll need to use [lerna commands](https://github.com/lerna/lerna/tree/master/commands) to manage the packages (for example, adding a new package to be used by one or multiple existing packages)

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

A brief description of the packages in `icon-magic`. More info lives in their READMEs.

### @icon-magic/blueprint

A basic blueprint folder for an Icon Magic package. This module should never be published. Instead, it can be copied to another directory in `/packages/@icon-magic` (don't forget to re-name it in `package.json` too!) to create a new basic functioning module.

Most Icon Magic packages are built with Typescript, tested with Mocha, and linted with tslint using custom rules from `@icon-magic/code-style`.

### @icon-magic/code-style

Shared tslint config for all icon magic packages.

### [@icon-magic/config-reader](packages/@icon-magic/config-reader)

Finds the closest config file(iconrc.json/iconrc.js/icon) to an icon and resolving all the paths in the
config file so it's relative to the icon bundle. It helps in

- Locating config files within directories
- Provides utils to read, validate and write icon config files
- Defining and managing the data for each icon
- Managing the config data for a set of icons in memory via a hash

### [@icon-magic/icon-models](packages/@icon-magic/icon-models)

The core of @icon-magic. Contains all the classes that represent the icon and a set of icons.

- defining the Icon and IconSet interfaces
- exposing a class that manipulates the icon in memory
- provides plugin-manager functions that apply plugins on the icon
- provides utils for writing the icon and it's config to disk

### [@icon-magic/build](packages/@icon-magic/build)

Constructs the various flavors (in `svg` format) that an icon can exist in from it's different variants and moves these resulting flavors to a destination folder. It also generates a config file, one for each icon and stores it along with the icon it's in output folder.

### [@icon-magic/generate](packages/@icon-magic/generate)

Generating the flavors of the icon in all the different types in which it can be consumed [(optimized)`svg`, `png` and `webp`].

### [@icon-magic/distribute](packages/@icon-magic/distribute)

Organizes and structures the assets (from the generate step) how they need to be consumed and creates the necessary files for platform consumption. For example, creates `Contents.json` for `webp` files and generates a sprite for web consumption.

### [@icon-magic/cli](packages/@icon-magic/cli)

Icon Magic command line. For running the build, generate, distribute steps on an input directory of icons.

### [@icon-magic/imagemin-farm](packages/@icon-magic/imagemin-farm)

Minifies images!

### [@icon-magic/svg-to-png](packages/@icon-magic/svg-to-png)

Quickly converts an SVG file to a PNG file using Puppeteer.

### @icon-magic/library

Type definitions and type conversion primitives for an "icon bundle"

### TODO

- Split `Bundle` / `Icon` / `Asset` type definitions and filesystem ingestion from asset primitive generation. Move to independent packages.
- Create exporters for iOS, Android and Web. Takes primitives folder and moves to correct folder structure.
- Create icon bundle validator. Will all the metadata on Assets, we can determine if there are support gaps for a given icon – ex: no asset for 24px icon sizes, missing support for 2x screens, etc.
- Create API server for adding, modifying and removing icons from a bundle (Foundations for this live in `@icon-magic/server`.
- Create WYSIWYG manager for icon bundles – Drag and drop interface for managing
  icon bundles, icons and their assets. This uses the API server under the hood
  to modify assets. May be built as an Express middleware to interop nicely with
  `@icon-magic/server`.
