import * as path from 'path';

const webp = require('webp-converter');

export async function convertToWebp(input: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const tmp = path.parse(input);
    delete tmp.base;
    tmp.ext = '.webp';
    const out = path.format(tmp);
    webp.cwebp(input, out, '-q 80', function(status: string) {
      console.log(arguments);
      !!~status.indexOf('100') ? resolve(out) : reject();
    });
  });
}
