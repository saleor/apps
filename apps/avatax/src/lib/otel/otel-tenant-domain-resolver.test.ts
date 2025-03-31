import { describe, expect, it, vi } from "vitest";

import { env } from "@/env";

import { OtelTenatDomainResolver } from "./otel-tenant-domain-resolver";

const createMockedLoggerContext = (domain: string) => ({
  getTenantDomain: () => domain,
});

describe("OtelTenatDomainResolver", () => {
  it("returns domain when it's in allowlist", () => {
    vi.mocked(env).TENANT_DOMAIN_ALLOWLIST = ["example.com", "test.com"];

    const resolver = new OtelTenatDomainResolver({
      loggerContext: createMockedLoggerContext("example.com"),
    });

    expect(resolver.getDomain()).toBe("example.com");
  });

  it("returns 'other' when domain is not in allowlist", () => {
    vi.mocked(env).TENANT_DOMAIN_ALLOWLIST = ["example.com", "test.com"];

    const resolver = new OtelTenatDomainResolver({
      loggerContext: createMockedLoggerContext("not-in-allowlist.com"),
    });

    expect(resolver.getDomain()).toBe("other");
  });

  it("handles empty allowlist", () => {
    vi.mocked(env).TENANT_DOMAIN_ALLOWLIST = [];

    const resolver = new OtelTenatDomainResolver({
      loggerContext: createMockedLoggerContext("any-domain.com"),
    });

    expect(resolver.getDomain()).toBe("other");
  });

  it("handles multiple domains in allowlist", () => {
    vi.mocked(env).TENANT_DOMAIN_ALLOWLIST = ["one.com", "two.com", "three.com"];

    const resolver = new OtelTenatDomainResolver({
      loggerContext: createMockedLoggerContext("two.com"),
    });

    expect(resolver.getDomain()).toBe("two.com");
  });
});
