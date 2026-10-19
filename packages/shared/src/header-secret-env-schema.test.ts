import { describe, expect, it } from "vitest";

import { headerSecretEnv } from "./header-secret-env-schema";

describe("headerSecretEnv", () => {
  it("accepts printable ASCII", () => {
    expect(headerSecretEnv.parse("aB3-_.~!#$%^&*()/+= x")).toBe("aB3-_.~!#$%^&*()/+= x");
  });

  it("rejects non-ASCII characters that fetch cannot send in a header", () => {
    expect(() => headerSecretEnv.parse("secret-š")).toThrow();
  });

  it("rejects control characters", () => {
    expect(() => headerSecretEnv.parse("secret\n")).toThrow();
  });
});
