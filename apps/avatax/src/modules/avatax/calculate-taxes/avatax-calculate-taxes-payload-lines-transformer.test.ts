import { describe, expect, it } from "vitest";
import { AvataxCalculateTaxesMockGenerator } from "./avatax-calculate-taxes-mock-generator";
import { AvataxCalculateTaxesPayloadLinesTransformer } from "./avatax-calculate-taxes-payload-lines-transformer";
import { TaxBaseFragment, VoucherTypeEnum } from "../../../../generated/graphql";

const transformer = new AvataxCalculateTaxesPayloadLinesTransformer();

const mockTaxBaseWithDiscountedLine = (taxBaseMock: TaxBaseFragment) => {
  return {
    ...taxBaseMock,
    lines: [
      {
        ...taxBaseMock.lines[0],
        totalPrice: {
          amount: 50,
        },
      },
      ...taxBaseMock.lines.slice(1),
    ],
  };
};

const addVoucher = (
  taxBaseMock: TaxBaseFragment,
  voucherType: VoucherTypeEnum,
): TaxBaseFragment => {
  return {
    ...taxBaseMock,
    sourceObject: {
      ...taxBaseMock.sourceObject,
      voucher: {
        type: voucherType,
        id: "1",
        __typename: "Voucher",
      },
    },
  };
};

describe("AvataxCalculateTaxesPayloadLinesTransformer", () => {
  describe("transform", () => {
    it("maps lines, adds shipping as line and maps the tax code of one product", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const taxBaseMock = mockGenerator.generateTaxBase();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const matchesMock = mockGenerator.generateTaxCodeMatches();

      const lines = transformer.transform(taxBaseMock, avataxConfigMock, matchesMock);

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: "P0000000",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 48.33,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
          discounted: false,
        },
      ]);
    });
    it("when no shipping in tax base, does not add shipping as line", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const taxBaseMock = mockGenerator.generateTaxBase({ shippingPrice: { amount: 0 } });

      const lines = transformer.transform(taxBaseMock, avataxConfigMock, matchesMock);

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: "P0000000",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
      ]);
    });
    it("when discounts, sets discounted to true [entire checkout voucher]", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const taxBaseMock = mockGenerator.generateTaxBase({
        discounts: [{ amount: { amount: 10 } }],
      });

      const modifiedTaxBaseMock = mockTaxBaseWithDiscountedLine(
        addVoucher(taxBaseMock, VoucherTypeEnum.EntireOrder),
      );

      const lines = transformer.transform(modifiedTaxBaseMock, avataxConfigMock, matchesMock);

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: "P0000000",
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: "",
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: "",
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 48.33,
          discounted: false,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
        },
      ]);
    });
    it("when specific discounts, sets one discounted item to true [specific item voucher]", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const taxBaseMock = mockGenerator.generateTaxBase({
        discounts: [{ amount: { amount: 10 } }],
      });

      const modifiedTaxBaseMock = mockTaxBaseWithDiscountedLine(
        addVoucher(taxBaseMock, VoucherTypeEnum.SpecificProduct),
      );

      const lines = transformer.transform(modifiedTaxBaseMock, avataxConfigMock, matchesMock);

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: "P0000000",
          taxIncluded: true,
          discounted: true,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 48.33,
          discounted: false,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
        },
      ]);
    });

    it("when shipping discounts, sets shipping line discount to true [specific item voucher]", () => {
      const mockGenerator = new AvataxCalculateTaxesMockGenerator();
      const avataxConfigMock = mockGenerator.generateAvataxConfig();
      const matchesMock = mockGenerator.generateTaxCodeMatches();
      const taxBaseMock = mockGenerator.generateTaxBase({
        discounts: [{ amount: { amount: 10 } }],
      });

      const modifiedTaxBaseMock = addVoucher(taxBaseMock, VoucherTypeEnum.Shipping);

      const lines = transformer.transform(modifiedTaxBaseMock, avataxConfigMock, matchesMock);

      expect(lines).toEqual([
        {
          amount: 60,
          quantity: 3,
          taxCode: "P0000000",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 20,
          quantity: 1,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 100,
          quantity: 2,
          taxCode: "",
          taxIncluded: true,
          discounted: false,
        },
        {
          amount: 48.33,
          discounted: true,
          itemCode: "Shipping",
          quantity: 1,
          taxCode: "FR000000",
          taxIncluded: true,
        },
      ]);
    });
  });
});
