# @icon-magic/cli

> Icon Magic command line.

## Install

Using npm:

```sh
npm install --save-dev @icon-magic/cli
```

or using yarn:

```sh
yarn add @icon-magic/cli --dev
```

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

## Usage

For a detailed list of the terminology, refer to the glossary above.

```
Usage:
  icon-magic [command] [options] <directories ...>

Commands:
  build               Construct flavors that an icon from its variants, after applying the build plugins.
  generate            Generates the flavors of the icon in the extension types that it can be consumed.
  distribute          Moves an icon from the source to the destination, applying plugins if specified.

Options:
  -c, --config        Path to config file name
  -i, --inputPath     Path to the input directory of icons
  -o, --outputPath    Path to the output directory where the generated assets are to be written to
  -t, --type          type of icons format to handle, accepted types are svg|png|webp
  -g, --groupByCategory [for web sprite creation] if to how to group the icons by category
  -h, --help          Display usage
  -v, --version       Display version
```

## Commands

If no command is specified after `icon-magic`, the CLI runs `build` and
`generate` on the directories specified

```
icon-magic .
```

### Build

```
icon-magic build .
```

Given a set of input directories, finds the closest [config
file](../config-reader/README.md) and "builds" the icons from it. Refer
[@icon-magic/build](../build/README.md) for more details.

### Generate

```
icon-magic generate .
```

Given a directory of icons (each icon containing it's own config file consisting
of all the flavors from the build step), the generate step is responsible for
going through the config file to determine the platforms on which the icon needs
to be supported. Refer [@icon-magic/build](../generate/README.md) for more details.

### Distribute

```
icon-magic distribute inputPath outputPath
```

Moves the icons from an input folder to the output folder. Optional filters can
be passed in. Refer [@icon-magic/build](../distribute/README.md) for more details.
