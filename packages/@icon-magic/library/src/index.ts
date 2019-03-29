import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as debug from 'debug';
import * as progress from 'cli-progress';

import { convert } from '@icon-magic/svg-to-png';
import { minify, subscribe, ProcessStatus } from '@icon-magic/imagemin-farm';

import { encode, decode } from './png-metadata';
import { convertToWebp } from './png-to-webp';

const DEBUG = debug('icon-magic:library');

const HASH_KEY = 'icon-magic-hash';

export type Type = 'regular' | 'inverse' | 'color';
export type Platform = 'ios' | 'android' | 'web';

export const MANIFEST_NAME = 'iconrc.json';

export interface MaxMin {
  max: number;
  min: number;
}

export interface WidthHeight {
  width: number | MaxMin;
  height: number | MaxMin;
}

export type AssetSize = number | MaxMin | WidthHeight;

export interface Asset {
  path: string;
  type: Type;
  resolutions: number[];
  platforms: Platform[];
  sizes: AssetSize[];
}

export interface Icon {
  name: string;
  path: string;
  assets: Asset[];
}

export interface Bundle {
  name: string;
  icons: Icon[];
}

/**
 * Returns weather a given icon has coverage for all possible
 * asset variation combinations.
 * @param icon  The Icon to test
 * @returns true or false if has coverage.
 */
export function hasAssetCoverage(icon: Icon): boolean {
  return !!icon;
}

export function validateAssetManifest(
  manifest: any
): manifest is Asset | never {
  if (!manifest.path) {
    throw new Error(`Invalid asset path ${manifest.asset}`);
  }

  // TODO: Write full validator

  return true;
}

export function validateIconManifest(manifest: any): manifest is Icon | never {
  if (!manifest.name) {
    throw new Error(`Invalid icon name ${manifest.name}`);
  }
  for (let asset of manifest.assets) {
    validateAssetManifest(asset);
  }
  return true;
}

export function readIcon(dir: string): Icon {
  let manifest: Icon = JSON.parse(
    fs.readFileSync(path.join(dir, MANIFEST_NAME)).toString()
  );
  validateIconManifest(manifest);
  manifest.path = dir;
  return manifest;
}

function isNumber(val: any): val is number {
  return typeof val === 'number';
}
function isMaxMin(val: any): val is MaxMin {
  return isNumber(val.max) && isNumber(val.min);
}
function isAssetSize(val: any): val is MaxMin {
  return (
    (isNumber(val.width) || isMaxMin(val.width)) &&
    (isNumber(val.height) || isMaxMin(val.height))
  );
}

function getWidth(size: number | MaxMin | AssetSize): MaxMin {
  if (isNumber(size)) {
    return { max: size, min: size };
  }
  if (isMaxMin(size)) {
    return size;
  }
  if (isAssetSize(size)) {
    return isMaxMin(size.width)
      ? size.width
      : { max: size.width, min: size.width };
  }
  throw new Error('Invalid asset width.');
}

function getHeight(size: number | MaxMin | AssetSize): MaxMin {
  if (isNumber(size)) {
    return { max: size, min: size };
  }
  if (isMaxMin(size)) {
    return size;
  }
  if (isAssetSize(size)) {
    return isMaxMin(size.height)
      ? size.height
      : { max: size.height, min: size.height };
  }
  throw new Error('Invalid asset height.');
}

async function processIcon(
  svg: string,
  width: number,
  height: number,
  hash: string,
  out: string
): Promise<void> {
  let png = await convert(svg, { width, height });
  await fs.writeFile(out, png);
  let webpOut = await convertToWebp(out);
  await Promise.all([minify(out), minify(webpOut)]);
  png = await fs.readFile(out);
  png = encode(png, HASH_KEY, hash);
  await fs.writeFile(out, png);
}

export async function iconToPNGs(icon: string | Icon) {
  if (typeof icon === 'string') {
    icon = readIcon(icon);
  }
  const tmpDir = path.join(icon.path, 'tmp');
  await fs.mkdirp(tmpDir);
  const iconPromises: Promise<void>[] = [];
  for (let asset of icon.assets) {
    let svg = await fs.readFile(path.join(icon.path, asset.path), {
      encoding: 'utf8'
    });
    let hash = crypto
      .createHash('md5')
      .update(svg)
      .digest('hex');
    let done: Set<string> = new Set();
    for (let res of asset.resolutions) {
      for (let size of asset.sizes) {
        for (let w of Object.values(getWidth(size))) {
          for (let h of Object.values(getHeight(size))) {
            let realSize = `${w * res}x${h * res}`;
            let out = path.join(tmpDir, `${icon.name}_${realSize}.png`);
            if (done.has(realSize)) {
              DEBUG(`Skipping ${icon.name}_${realSize}: Already Exists.`);
              continue;
            }
            done.add(realSize);
            if (
              fs.existsSync(out) &&
              decode(fs.readFileSync(out), HASH_KEY) === hash
            ) {
              DEBUG(
                `Skipping ${icon.name}_${w * res}x${h *
                  res}: Identical exists from previous run.`
              );
              continue;
            }
            iconPromises.push(processIcon(svg, w * res, h * res, hash, out));
          }
        }
      }
    }
  }
  await Promise.all(iconPromises);
}

const progressBar = new progress.Bar({}, progress.Presets.shades_classic);
progressBar.start(1, 0);
subscribe((stat: ProcessStatus) => progressBar.update(stat.progress));
