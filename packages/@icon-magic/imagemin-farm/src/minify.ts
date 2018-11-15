import * as path from 'path';

const imagemin = require('imagemin');
const optipng   = require('imagemin-optipng');
const zopfli   = require('imagemin-zopfli');
const advpng   = require('imagemin-advpng');
const pngcrush = require('imagemin-pngcrush');

// On each message from the parent process, put the image through the gauntlet
export function minifyFile(file: string): Promise<void> {

  return new Promise(async (resolve, reject) => {

    // Start Imagemin with the image path
    imagemin([file], path.dirname(file), {
      plugins: [
        optipng({optimizationLevel: 3}),
        zopfli({more: true}),
        advpng({optimizationLevel: 4}),
        pngcrush({reduce: true}),
      ]
    }).then((files: any) => {
      resolve(files[0].path);
    }, reject);

  });
}