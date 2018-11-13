import * as assert from "assert";

import iconMagic from "../src";

describe("Test test", function () {
  it("rust tests", async () => {
    assert.ok(iconMagic === "test", "Accesses exports");
  });
});
