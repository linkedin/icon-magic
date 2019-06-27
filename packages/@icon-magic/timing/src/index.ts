let start: [number, number];
const pretty = require('pretty-time');

export function timer() {
  return {
    start: function(): void {
      start = process.hrtime();
    },
    end: function(): string {
      const end = process.hrtime(start);
      return pretty(end);
    }
  };
}
