const encodePNG = require('png-chunks-encode');
const extractPNG = require('png-chunks-extract');
const { encode: encodeText, decode: decodeText } = require('png-chunk-text');

interface Chunk {
  name: string;
  keyword: string;
  text: string;
}

export function encode(buffer: Buffer, key: string, value: string) {
  const chunks = extractPNG(buffer);
  chunks.splice(-1, 0, encodeText(key, value));
  return new Buffer(encodePNG(chunks));
}

export function decode(buffer: Buffer, key: string): string | undefined {
  const chunks = extractPNG(buffer);
  const textChunks = chunks.filter(function (chunk: Chunk) {
    return chunk.name === 'tEXt';
  }).map(function (chunk: any) {
    return decodeText(chunk.data);
  });

  for (const chunk of textChunks) {
    if (chunk.keyword === key) { return chunk.text; }
  }

  return undefined;

}