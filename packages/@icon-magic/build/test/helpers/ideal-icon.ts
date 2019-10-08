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
} from '@icon-magic/icon-models';
import * as path from 'path';

import { getNameFromPropCombo } from './utils';

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

export const lastBuildPluginUpdated = {
  name: 'p3',
  fn: async (asset: Asset, icon: Icon, params?: object): Promise<Asset> => {
    return new Asset(icon.iconPath, {
      name: getNameFromPropCombo(asset.name, params),
      path: asset.getPath(),
      contents: 'p3x2'
    });
  },
  iterants: ['sizes']
};

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
    name: 'filled'
  },
  {
    path: './outline.svg',
    name: 'someOtherName'
  }
];

export const flavors: FlavorConfig[] = [
  {
    path: './filled-a.svg',
    name: 'filled',
    types: sampleExt
  },
  {
    path: './filled-b.svg',
    name: 'filled-b',
    types: sampleExt
  },
  {
    path: './someOtherName-a.svg',
    name: 'someOtherName',
    types: sampleExt
  },
  {
    path: './someOtherName-b.svg',
    name: 'someOtherName-b',
    types: sampleExt
  }
];

export const idealIcon: IconConfig = {
  iconPath: `${FIXTURES}/input/nav-icons/home`,
  iconName: 'home',
  variants: variants,
  outputPath: `${FIXTURES}/out`,
  build: build,
  generate: generate,
  sizes: [16, 24],
  resolutions: [1, 2],
  sourceConfigFile: `${FIXTURES}/input/nav-icons/iconrc.json`
};
