import * as path from "path";

import * as fs from "fs-extra";

import { run } from "./browserPool";

export interface SVGToPNGOptions {
  width: number;
  height: number;
  headless?: boolean;
}

export async function convertFile(fileName: string, options: SVGToPNGOptions): Promise<Buffer> {
  if (!path.isAbsolute(fileName)) {
    throw new Error("svg-to-png expects an absolute filepath");
  }
  let contents = await fs.readFile(fileName);
  return await convert(contents.toString(), options);
}

export async function convert(contents: string, options: SVGToPNGOptions): Promise<Buffer> {
  if (!contents) {
    throw new Error("No contents discovered.");
  }
  return await run(async (page) => {
    await page.setContent(contents.toString().replace('<svg', `<svg style="width: ${options.width}px; height: ${options.height}px; position: fixed; top:0; left: 0;" `));
    return await page.screenshot({
      encoding: "binary",
      omitBackground: true,
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: options.width,
        height: options.height,
      }
    });
  });
}
