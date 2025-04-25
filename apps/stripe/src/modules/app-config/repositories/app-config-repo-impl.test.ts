import { describe, expect, it } from "vitest";

import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";

describe("App Config Repo Implementation", () => {
  it("Exports instance of repo, doesnt throw", () => {
    expect(appConfigRepoImpl).toBeDefined();
  });
});
