import { describe, expect, it } from "vitest";

import { appTransactionRepo } from "./app-transaction-repo";

describe("App Transaction Repo Implementation", () => {
  it("Exports instance of repo, doesn't throw", () => {
    expect(appTransactionRepo).toBeDefined();
  });
});
