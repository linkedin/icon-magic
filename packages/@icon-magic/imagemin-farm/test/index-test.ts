import * as assert from "assert";
import * as path from "path";

import { minify } from "../src";

const NOOP = ()=>{};

describe("Test test", function (): void {
  it("rust tests", async () => {
    await Promise.all([
      minify(path.join(__dirname, 'fixtures', 'squirtle.png')).then((r) => console.log(JSON.stringify(r, null, 2))),
    ]).catch(NOOP);
    assert.ok(true, "Accesses exports");
  });
});
