import { configSchema } from './schemas/config-schema';
import * as Ajv from 'ajv';

let metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');

/**
 * Validates the top level properties of the config object.
 * @param config The config object to validate.
 */
export function validateConfigSchema(config: object): Boolean {
  return validateSchema(config, configSchema);
}

export function validateSchema(data: object, schema: object) {
  const ajv = new Ajv({
    meta: false,
    useDefaults: true,
    validateSchema: false,
    missingRefs: 'ignore',
    verbose: true,
    schemaId: 'auto',
    allErrors: true
  });

  ajv.addMetaSchema(metaSchema);
  const ajvValidate = ajv.compile(schema);
  if (!ajvValidate(data)) {
    console.error(ajvValidate.errors);
    throw new Error(`${data} did not match ${schema}`);
  }
  return true;
}
