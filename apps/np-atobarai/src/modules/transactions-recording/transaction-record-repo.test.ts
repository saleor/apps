import { describe, expect, it } from "vitest";

import { transactionRecordRepo } from "./transaction-record-repo";

describe("App Transaction Repo Implementation", () => {
  it("Exports instance of repo, doesn't throw", () => {
    expect(transactionRecordRepo).toBeDefined();
  });
});
