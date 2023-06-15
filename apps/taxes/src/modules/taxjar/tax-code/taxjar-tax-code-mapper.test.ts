import { TaxCode } from "../../tax-codes/tax-code-match-schema";
import { TaxJarTaxCodeMapper } from "./taxjar-tax-code-mapper";
import { describe, expect, it } from "vitest";
import { TaxJarTaxCodeMatches } from "./taxjar-tax-code-match-repository";

const mapper = new TaxJarTaxCodeMapper();

const mockedTaxJarTaxCodes: TaxCode[] = [
  {
    code: "P0000000",
    name: "Clothing",
  },
  {
    code: "P0000001",
    name: "Shoes",
  },
];

describe("TaxJarTaxCodeMapper", () => {
  it("returns an array of two tax code matches, one mapped to saved match", () => {
    const mockedSavedMatches: TaxJarTaxCodeMatches = [
      {
        data: {
          saleorTaxClass: {
            id: "22b78110-afe0-42dd-96fc-35b050997074",
            name: "Clothing",
          },
          taxJarTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: "1",
      },
    ];
    const mappedTaxCodes = mapper.map(mockedTaxJarTaxCodes, mockedSavedMatches);

    expect(mappedTaxCodes).toEqual([
      {
        data: {
          saleorTaxClass: {
            id: "22b78110-afe0-42dd-96fc-35b050997074",
            name: "Clothing",
          },
          taxJarTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: expect.any(String),
      },
      {
        data: {
          saleorTaxClass: null,
          taxJarTaxCode: {
            code: "P0000001",
            name: "Shoes",
          },
        },
        id: expect.any(String),
      },
    ]);
  });
  it("returns an array of two tax code matches with no match", () => {
    const mockedSavedMatches: TaxJarTaxCodeMatches = [];
    const mappedTaxCodes = mapper.map(mockedTaxJarTaxCodes, mockedSavedMatches);

    expect(mappedTaxCodes).toEqual([
      {
        data: {
          saleorTaxClass: null,
          taxJarTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: expect.any(String),
      },
      {
        data: {
          saleorTaxClass: null,
          taxJarTaxCode: {
            code: "P0000001",
            name: "Shoes",
          },
        },
        id: expect.any(String),
      },
    ]);
  });
});
