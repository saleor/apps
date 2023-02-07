import { beforeEach, describe, it } from "vitest";
import { MicroinvoiceInvoiceGenerator } from "./microinvoice-invoice-generator";
import { readFile } from "fs/promises";
import rimraf from "rimraf";
import { mockOrder } from "../../../fixtures/mock-order";
import { getMockAddress } from "../../../fixtures/mock-address";

const cleanup = () => rimraf.sync("test-invoice.pdf");

describe("MicroinvoiceInvoiceGenerator", () => {
  beforeEach(() => {
    cleanup();
  });

  // afterEach(() => {
  //   cleanup();
  // });

  it("Generates invoice file from Order", async () => {
    const instance = new MicroinvoiceInvoiceGenerator();

    await instance.generate({
      order: mockOrder,
      filename: "test-invoice.pdf",
      invoiceNumber: "test-123/123",
      companyAddressData: getMockAddress(),
    });

    return readFile("test-invoice.pdf");
  });
});
