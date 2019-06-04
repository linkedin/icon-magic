# @icon-magic/svg-to-png

Quickly converts an SVG file to a PNG file using Puppeteer. On process start, it spins up `os.cpus() - 1` independent browser instances to farm conversion tasks out across multiple processes. Exports two main methods:

## async convertFile(fileName: string, options: SVGToPNGOptions): Promise<Buffer>

Given a path to a file, return the PNG buffer of the converted image.

## async convert(contents: string, options: SVGToPNGOptions): Promise<Buffer>

Given the contents of a SVG file, return the PNG buffer of the converted image.

## Options

Conversion options use the following interface:

```typescript
interface SVGToPNGOptions {
  width: number; // Width of the output PNG.
  height: number; // Height of the output PNG.
  headless?: boolean; // If the browser converting the image should be headless or not. Useful for debugging.
}
```
