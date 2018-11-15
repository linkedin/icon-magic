import * as assert from "assert";

import { app, start, stop } from "../src";

describe("Test test", async function () {
  it("rust tests", async () => {
    start();
    assert.ok(app, "Accesses exports");
    await stop();
  });
});
