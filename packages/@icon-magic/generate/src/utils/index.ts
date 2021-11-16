/**
 * Convert a string from kebab-case to camelCase
 * @param {string} s string to convert to camel case
 * @returns {string} camelCased string
 */
export function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}

/**
 * Remove newline, tabs, and whitespaces between html tags
 * @param {string} markup - HTML tags
 * @returns {string}
 */
export function stripSpacesBetweenTags(markup: string): string {
  return markup.replace(/\n/g, '')
    .replace(/>[\t ]+</g, '><')
    .trim();
}
