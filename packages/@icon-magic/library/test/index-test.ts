import * as assert from "assert";
import * as fs from "fs-extra";
import * as path from "path";

import { iconToPNGs } from "../src";

describe("Test test", function () {
  it("rust tests", async () => {
    const icon = path.join(__dirname, 'fixtures', 'pokemon', 'squirtle');
    await iconToPNGs(icon);
    await iconToPNGs(icon);
    let svg = fs.readFileSync(path.join(icon, 'squirtle.svg')).toString();
    svg += 'woo';
    fs.writeFileSync(path.join(icon, 'squirtle.svg'), svg);
    await iconToPNGs(icon);
    assert.ok(true, "Accesses exports");
  });
});
