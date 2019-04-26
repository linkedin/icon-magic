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

  it("fails when the variant doesn't contain a path", async () => {
    const testConfig = {
      iconPath: './fixtures/icons',
      variants: [
        {
          name: 'abc'
        }
      ],
      build: {},
      generate: {},
      distribute: {}
    };

    assert.throws(() => validateConfigSchema(testConfig), 'Error is thrown');
  });
});
