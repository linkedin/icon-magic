# @icon-magic/icon-models

This is the core of @icon-magic as it contains all the classes for that
represent the icon and a set of icons.

- defining the Icon and IconSet interfaces
- exposing a class that manipulates the icon in memory
- provides plugin-manager functions that apply plugins on the icon
- provides utils for writing the icon and it's config to disk

## Interface

### Asset

Abstracts the smallest set of information that pertains to an asset file in
memory. Primary, it's path, name and contents, if it's already read into memory

### Flavor

In it's simplist definition, a Flavor is an Asset with types. This class
contains Assets for all the different types in which it can exist For example, a
Flavor consists of it's source svg as well as paths to it's png and webp assets

### Icon

Encapsulates what an Icon means. An Icon is referenced by a path to it's
directory and this directory can be assumed to contain all the different
variants and flavors in which the icon is available, in all of it's different
types(extensions). The config itself is generally more concise and human
readable but this class supplements it by providing methods on it and filling in
the gaps where they don't exist

### Icon Set

Encapsulates a set of icons and consists of a mapping of the directory to the
icon bundle and the Icon class associated with that icon

### Plugin-runner

Plugin runner is responsible for consecutively iterating through different
properties of the config file, such as variants/flavors and applying the list of
plugins on each variant/flavor If a plugin has more than one prop, then it
results in multiple files, one for each combinations of props. Else, one input
file will result in one output file. eg: P1 has [T1, T2] and runs on A.svg =>
A-T1.svg and A-T2.svg P2 has one theme - [theme1], then the result will still be
A-T1.svg and A-T2.svg the hyphenated theme name gets added only if there is more
than one theme for a plugin
