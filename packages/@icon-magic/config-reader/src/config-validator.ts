import { configSchema } from './schemas/config-schema';
import * as Ajv from 'ajv';

let metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');

/**
 * Validates the top level properties of the icon config
 * @param config The config object to validate
 * @returns whether or not a config matches the icon schema
 */
export function validateConfigSchema(config: object): Boolean {
  return validateSchema(config, configSchema);
}

/**
 * Validates the top level properties of the icon config
 * @param config The config object to validate
 * @param schema The schema against which we validate the config object
 * @returns whether or not the config satisfies the schema
 */
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
    throw new Error(
      `${data} did not match ${schema}\nError: ${ajvValidate.errors}`
    );
  }
  return true;
}
