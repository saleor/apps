import { describe, it, expect, vi } from "vitest";
import { hashInvoiceFilename } from "./hash-invoice-filename";

vi.mock("crypto", async () => {
  const actual = (await vi.importActual("crypto")) as Crypto;

  return {
    default: {
      ...actual,
      randomUUID() {
        return "RANDOM_UUID_MOCK";
      },
    },
  };
});

describe("hashInvoiceFilename", () => {
  it("Creates hashed invoice name", () => {
    expect(hashInvoiceFilename("1/12/2022", "1234-xxxx-zzzz-1234")).toBe(
      "1/12/2022_1234-xxxx-zzzz-1234_RANDOM_UUID_MOCK",
    );
  });
});
