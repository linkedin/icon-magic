import * as assert from "assert";

import { foo } from "../src";

describe("Test test", function (): void {
  it("rust tests", async () => {
    assert.ok(foo === "test", "Accesses exports");
  });
});
