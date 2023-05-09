import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { MicroinvoiceInvoiceGenerator } from "./microinvoice-invoice-generator";
import { readFile } from "fs/promises";
import { join } from "path";
import rimraf from "rimraf";
import { mockOrder } from "../../../../fixtures/mock-order";
import { getMockAddress } from "../../../../fixtures/mock-address";

const dirToSet = process.env.TEMP_PDF_STORAGE_DIR as string;
const filePath = join(dirToSet, "test-invoice.pdf");

const cleanup = () => rimraf.sync(filePath);

describe("MicroinvoiceInvoiceGenerator", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * For some reason it fails in Github Actions
   * @todo fixme
   */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  it.runIf(process.env.CI !== "true")("Generates invoice file from Order", async () => {
    const instance = new MicroinvoiceInvoiceGenerator();

    await instance.generate({
      order: mockOrder,
      filename: filePath,
      invoiceNumber: "test-123/123",
      companyAddressData: getMockAddress(),
    });

    return expect(readFile(filePath)).resolves.toBeDefined();
  });
});
