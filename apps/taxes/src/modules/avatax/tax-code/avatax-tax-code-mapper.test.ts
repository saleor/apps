import { TaxCode } from "../../tax-codes/tax-code-match-schema";
import { AvataxTaxCodeMapper } from "./avatax-tax-code-mapper";
import { describe, expect, it } from "vitest";
import { AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";

const mapper = new AvataxTaxCodeMapper();

const mockedAvataxTaxCodes: TaxCode[] = [
  {
    code: "P0000000",
    name: "Clothing",
  },
  {
    code: "P0000001",
    name: "Shoes",
  },
];

describe("AvataxTaxCodeMapper", () => {
  it("returns an array of two tax code matches, one mapped to saved match", () => {
    const mockedSavedMatches: AvataxTaxCodeMatches = [
      {
        data: {
          saleorTaxClass: {
            id: "22b78110-afe0-42dd-96fc-35b050997074",
            name: "Clothing",
          },
          avataxTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: "1",
      },
    ];
    const mappedTaxCodes = mapper.map(mockedAvataxTaxCodes, mockedSavedMatches);

    expect(mappedTaxCodes).toEqual([
      {
        data: {
          saleorTaxClass: {
            id: "22b78110-afe0-42dd-96fc-35b050997074",
            name: "Clothing",
          },
          avataxTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: expect.any(String),
      },
      {
        data: {
          saleorTaxClass: null,
          avataxTaxCode: {
            code: "P0000001",
            name: "Shoes",
          },
        },
        id: expect.any(String),
      },
    ]);
  });
  it("returns an array of two tax code matches with no match", () => {
    const mockedSavedMatches: AvataxTaxCodeMatches = [];
    const mappedTaxCodes = mapper.map(mockedAvataxTaxCodes, mockedSavedMatches);

    expect(mappedTaxCodes).toEqual([
      {
        data: {
          saleorTaxClass: null,
          avataxTaxCode: {
            code: "P0000000",
            name: "Clothing",
          },
        },
        id: expect.any(String),
      },
      {
        data: {
          saleorTaxClass: null,
          avataxTaxCode: {
            code: "P0000001",
            name: "Shoes",
          },
        },
        id: expect.any(String),
      },
    ]);
  });
});
