import { describe, expect, it } from "vitest";
import { resolveTempPdfFileLocation } from "./resolve-temp-pdf-file-location";

describe("resolveTempPdfFileLocation", () => {
  it("generates path with encoded file name, in case of invoice name contains path segments", () => {
    expect(resolveTempPdfFileLocation("12/12/2022-foobar.pdf")).toBe("12%2F12%2F2022-foobar.pdf");
  });
});
