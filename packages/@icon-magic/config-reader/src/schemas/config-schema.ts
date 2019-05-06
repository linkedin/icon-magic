const variantProperties = {
  name: { type: 'string' },
  path: { type: 'string', minLength: 1 }
};

const pluginProperties = {
  name: { type: 'string' },
  iterants: {
    type: ['array'],
    items: {
      type: 'string'
    }
  },
  params: ['object'],
  writeToOutput: {
    type: 'boolean',
    default: true
  }
};

const buildConfigProperties = {
  outputPath: { type: ['string', 'null'] },
  plugins: {
    type: ['array', 'null'],
    items: {
      type: ['object'],
      properties: pluginProperties,
      additionalProperties: true
    }
  }
};

const distributeConfigProperties = {};

const generateConfigProperties = {
  outputPath: { type: ['string', 'null'] },
  types: {
    type: ['array'],
    items: {
      type: ['object'],
      properties: {
        name: { type: 'string' },
        plugins: {
          type: ['array'],
          items: {
            type: ['object'],
            properties: pluginProperties,
            additionalProperties: true
          }
        }
      }
    }
  }
};

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
  sizes: {
    type: 'array',
    minItems: 1,
    items: {
      type: ['number', 'object'],
      properties:  {
        'width': { type: 'number' },
        'height': { type: 'number' }
      },
      required: ['width', 'height'],
      additionalProperties: false
    }
  },
  resolutions: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'number'
    }
  },
  build: {
    type: 'object',
    properties: buildConfigProperties,
    additionalProperties: false
  },
  generate: {
    type: 'object',
    properties: generateConfigProperties
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
