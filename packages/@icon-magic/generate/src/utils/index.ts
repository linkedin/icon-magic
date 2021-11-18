/**
 * Convert a string from kebab-case to camelCase
 * @param s string to convert to camel case
 */
export function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}

/**
 * Remove newline, tabs, and whitespaces between html tags
 * @param markup - HTML tags
 */
export function stripSpacesBetweenTags(markup: string): string {
  return markup && markup.replace(/\n/g, '')
    .replace(/>[\t ]+</g, '><')
    .trim();
}

/**
 * Convert a string from kebab-case to camelCase
 * @param s string to convert to camel case
 */
export function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}

/**
 * Remove newline, tabs, and whitespaces between html tags
 * @param markup - HTML tags
 */
export function stripSpacesBetweenTags(markup: string): string {
  return markup && markup.replace(/\n/g, '')
    .replace(/>[\t ]+</g, '><')
    .trim();
}
