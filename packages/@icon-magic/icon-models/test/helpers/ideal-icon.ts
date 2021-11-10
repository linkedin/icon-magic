import * as path from 'path';

import {
  Asset,
  AssetConfig,
  BuildConfig,
  BuildPlugin,
  FlavorConfig,
  FlavorTypeMap,
  GenerateConfig,
  Icon,
  IconConfig
} from '../../src';
import { getNameFromPropCombo } from '../../src/utils/prop-combinator';

const FIXTURES = path.resolve(__dirname, '..', '..', '..', 'test', 'fixtures');

const sampleExt: FlavorTypeMap = {
  svg: {
    name: 'filled-a.svg',
    path: './filled-a.svg'
  },
  png: {
    name: 'filled-a.png',
    path: './filled-a.png'
  },
  webp: {
    name: 'filled-a.webp',
    path: './filled-a.webp'
  }
};

const buildPlugins: BuildPlugin[] = [
  {
    name: 'p1',
    fn: async (asset: Asset, icon: Icon, params?: object): Promise<Asset> => {
      return new Asset(icon.iconPath, {
        name: getNameFromPropCombo(asset.name, params),
        path: asset.getPath(),
        contents: 'p1'
      });
    },
    iterants: ['resolutions'],
    writeToOutput: true
  },
  {
    name: 'p2',
    fn: async (asset: Asset, icon: Icon, params?: object): Promise<Asset> => {
      return new Asset(icon.iconPath, {
        name: getNameFromPropCombo(asset.name, params),
        path: asset.getPath(),
        contents: 'p2'
      });
    },
    iterants: ['sizes', 'resolutions']
  },
  {
    name: 'p3',
    fn: async (asset: Asset, icon: Icon, params?: object): Promise<Asset> => {
      return new Asset(icon.iconPath, {
        name: getNameFromPropCombo(asset.name, params),
        path: asset.getPath(),
        contents: 'p3'
      });
    },
    iterants: ['sizes']
  }
];

export const generate: GenerateConfig = {
  types: [
    {
      name: 'svg',
      plugins: []
    },
    {
      name: 'raster',
      plugins: []
    }
  ]
};

export const build: BuildConfig = {
  plugins: buildPlugins
};

export const variants: AssetConfig[] = [
  {
    path: './filled.svg',
    name: 'filled',
    sizes: [32, 44]
  },
  {
    path: './outline.svg',
    name: 'someOtherName',
    sizes: [32, 44]
  }
];

export const flavors: FlavorConfig[] = [
  {
    path: './filled-a.svg',
    name: 'filled-a',
    types: sampleExt
  },
  {
    path: './filled-b.svg',
    name: 'filled-b',
    types: sampleExt
  },
  {
    path: './someOtherName-a.svg',
    name: 'someOtherName-a',
    types: sampleExt
  },
  {
    path: './someOtherName-b.svg',
    name: 'someOtherName-b',
    types: sampleExt
  }
];

export const idealIcon: IconConfig = {
  iconPath: `${FIXTURES}/nav-icons/home`,
  iconName: 'home',
  variants: variants,
  flavors: flavors,
  outputPath: './out',
  build: build,
  generate: generate,
  sizes: [16, 24],
  resolutions: [1, 2],
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`
};
