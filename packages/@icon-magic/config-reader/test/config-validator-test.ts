import * as assert from 'assert';

import { validateConfigSchema } from '../src/config-validator';

describe('Validates the build config', () => {
  it('passes successfully when there are no errors', async () => {
    const testConfig = {
      iconPath: '.',
      variants: [
        {
          name: 'filled',
          path: './filled.svg'
        }
      ],
      build: {},
      generate: {},
      distribute: {}
    };
    assert.ok(validateConfigSchema(testConfig));
  });

  it('fails when there are errors in the config file', async () => {
    const testConfig = {
      iconPath: './fixtures/icons',
      variants: [
        {
          name: 'filled',
          path: './filled.svg'
        }
      ],
      someExtraData: 'that should throw an error',
      build: {}
    };
    assert.throws(() => validateConfigSchema(testConfig), 'Error is thrown');
  });

  it("fails when iconPath isn't present", async () => {
    const testConfig = {
      variants: [
        {
          name: 'filled',
          path: './filled.svg'
        }
      ],
      build: {}
    };
    assert.throws(() => validateConfigSchema(testConfig), 'Error is thrown');
  });

  it("fails when it doesn't have any variants", async () => {
    const testConfig = {
      iconPath: './fixtures/icons',
      build: {},
      generate: {},
      distribute: {}
    };

    assert.throws(() => validateConfigSchema(testConfig), 'Error is thrown');
  });

  it('fails when variants are empty', async () => {
    const testConfig = {
      iconPath: './fixtures/icons',
      build: {},
      variants: [],
      generate: {},
      distribute: {}
    };

    assert.throws(() => validateConfigSchema(testConfig), 'Error is thrown');
  });

  it("passes when sizes are part of the variants and not the icon itself", async () => {
    const testConfig = {
      "iconPath": ".",
      "variants": [
        {
          "name": "small",
          "path": "./small.svg",
          "sizes": [48]

        },
        {
          "name": "small-on-dark",
          "path": "./small-on-dark.svg",
          "colorScheme": "dark",
          "imageset": "small",
          "sizes": [48]
        },
        {
          "name": "large",
          "path": "./large.svg",
          "sizes": [64]
        },
        {
          "name": "large-on-dark",
          "path": "./large-on-dark.svg",
          "colorScheme": "dark",
          "imageset": "large",
          "sizes": [64]
        }
      ],
      "category": "illustration-microspots",
      "resolutions": [1, 1.5, 2, 3, 4],
      "outputPath": "./out/mercado/illustration-microspots",
      "generate": {
        "types": [
          {
            "name": "svg",
            "plugins": [
              {
                "name": "svg-generate",
                "params": {
                  "isColored": true,
                  "isFixedDimensions": true
                }
              },
              {
                "name": "svg-light-dark",
                "params": {
                  "lightToken": "--hue-web-svg-display-light",
                  "darkToken": "--hue-web-svg-display-dark"
                }
              }
            ]
          },
          {
            "name": "raster",
            "plugins": [
              {
                "name": "svg-to-raster",
                "iterants": ["resolutions"],
                "assetIterants": ["sizes"]
              }
            ]
          }
        ]
      },
      "distribute": {
        "svg": {
          "toSprite": false
        },
        "webp": {
          "namePrefix": "img"
        }
      }
    };



    assert.ok(validateConfigSchema(testConfig));
  });
});
