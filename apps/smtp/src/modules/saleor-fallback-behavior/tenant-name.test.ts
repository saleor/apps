import { describe, expect, it } from "vitest";

import { TenantName } from "./tenant-name";

describe("TenantName", () => {
  describe("getTenantName", () => {
    it("replaces dots with underscores in the host", () => {
      const tenantName = new TenantName("https://my-store.saleor.cloud/graphql/");

      expect(tenantName.getTenantName()).toBe("my-store_saleor_cloud");
    });

    it("works with eu suffix", () => {
      const tenantName = new TenantName("https://my-store.eu.saleor.cloud/graphql/");

      expect(tenantName.getTenantName()).toBe("my-store_eu_saleor_cloud");
    });

    it("includes port in the result when present", () => {
      const tenantName = new TenantName("https://localhost:8000/graphql/");

      expect(tenantName.getTenantName()).toBe("localhost");
    });

    it("truncates result to 64 characters", () => {
      const longSubdomain = "a".repeat(60);
      const tenantName = new TenantName(`https://${longSubdomain}.saleor.cloud/graphql/`);

      expect(tenantName.getTenantName()).toHaveLength(64);
    });

    it("ignores the path portion of the URL", () => {
      const tenantName = new TenantName("https://my-store.saleor.cloud/graphql/");

      expect(tenantName.getTenantName()).not.toContain("graphql");
    });

    it("throws if invalid URL is provded", () => {
      const tenantName = new TenantName("invalid");

      expect(() => tenantName.getTenantName()).toThrowErrorMatchingInlineSnapshot(
        `[Error: Failed to parse Saleor API URL, usually that means Saleor request did not include it, or there is application error]`,
      );
    });
  });
});
