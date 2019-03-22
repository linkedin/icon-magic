const variantProperties = {
  name: { type: 'string' },
  path: { type: 'string', minLength: 1 }
};

const buildConfigProperties = {
  outputPath: { type: ['string', 'null'] },
  plugins: { type: ['array', 'null'] }
};

const distributeConfigProperties = {};

const generateConfigProperties = {};

const topLevelConfigProperties = {
  iconPath: { type: 'string', minLength: 1 },
  iconName: { type: ['string', 'null'] },
  variants: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      properties: variantProperties,
      required: ['path'],
      additionalProperties: false
    }
  },
  build: {
    type: 'object',
    properties: buildConfigProperties,
    additionalProperties: false
  },
  generate: {
    type: 'object',
    properties: generateConfigProperties,
    additionalProperties: false
  },
  distribute: {
    type: 'object',
    properties: distributeConfigProperties,
    additionalProperties: false
  }
};

export const configSchema = {
  type: 'object',
  properties: topLevelConfigProperties,
  required: ['iconPath', 'variants'],
  additionalProperties: false
};

export const variantSchema = {};

export const flavorSchema = {};
