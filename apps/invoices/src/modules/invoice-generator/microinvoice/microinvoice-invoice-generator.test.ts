import { describe, expect, it } from "vitest";
import { MicroinvoiceInvoiceGenerator } from "./microinvoice-invoice-generator";
import { readFile } from "fs/promises";
import { join } from "path";
// import rimraf from "rimraf";
import { mockOrder } from "../../../fixtures/mock-order";
import { getMockAddress } from "../../../fixtures/mock-address";

const dirToSet = process.env.TEMP_PDF_STORAGE_DIR as string;
const filePath = join(__dirname, dirToSet, "test-invoice.pdf");

// const cleanup = () => rimraf.sync(filePath);

describe("MicroinvoiceInvoiceGenerator", () => {
  // beforeEach(() => {
  //   cleanup();
  // });
  //
  // afterEach(() => {
  //   cleanup();
  // });

  it("Generates invoice file from Order", async () => {
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
