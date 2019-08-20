import * as assert from 'assert';
import * as fs from 'fs-extra';
import { Comparator, ImageComparer, Processor } from 'image-comparer';
import * as path from 'path';

import { convertFile } from '../src';

const comparer = ImageComparer.create()
  .withProcessor(Processor.PIXEL())
  .withComparator(Comparator.RGBA_PCT(0.2));

describe('SVG to PNG export', function() {
  it('works with a single file', async () => {
    const svgBuffer = await convertFile(
      path.join(__dirname, './fixtures/squirtle.svg'),
      {
        width: 100,
        height: 100
      }
    );
    const pngBuffer = await fs.readFile(
      path.join(__dirname, './fixtures/squirtle_100.png')
    );
    const diff = await comparer.compare(svgBuffer, pngBuffer);
    assert.ok(
      diff.pct < 0.02,
      'Given an SVG file path, returns a buffer with image content. Reproduces to previous runs within margin of error.'
    );
  });
  it('works with a multi file', async () => {
    const svg100BufferPromise = convertFile(
      path.join(__dirname, './fixtures/squirtle.svg'),
      {
        width: 100,
        height: 100
      }
    );
    const svg200BufferPromise = convertFile(
      path.join(__dirname, './fixtures/squirtle.svg'),
      {
        width: 200,
        height: 200
      }
    );
    const svg300BufferPromise = convertFile(
      path.join(__dirname, './fixtures/squirtle.svg'),
      {
        width: 300,
        height: 300
      }
    );
    const res = await Promise.all([
      svg100BufferPromise,
      svg200BufferPromise,
      svg300BufferPromise
    ]);
    await fs.writeFile(
      path.join(__dirname, './fixtures/squirtle_200.png'),
      res[1]
    );
    await fs.writeFile(
      path.join(__dirname, './fixtures/squirtle_300.png'),
      res[2]
    );

    const png100Buffer = await fs.readFile(
      path.join(__dirname, './fixtures/squirtle_100.png')
    );
    const png200Buffer = await fs.readFile(
      path.join(__dirname, './fixtures/squirtle_200.png')
    );
    const png300Buffer = await fs.readFile(
      path.join(__dirname, './fixtures/squirtle_300.png')
    );

    const diff100 = await comparer.compare(res[0], png100Buffer);
    const diff200 = await comparer.compare(res[1], png200Buffer);
    const diff300 = await comparer.compare(res[2], png300Buffer);

    assert.ok(
      diff100.pct < 0.02,
      'Given an SVG file path, returns a buffer with image content. Reproduces to previous runs within margin of error.'
    );
    assert.ok(
      diff200.pct < 0.02,
      'Given an SVG file path, returns a buffer with image content. Reproduces to previous runs within margin of error.'
    );
    assert.ok(
      diff300.pct < 0.02,
      'Given an SVG file path, returns a buffer with image content. Reproduces to previous runs within margin of error.'
    );
  });
});
