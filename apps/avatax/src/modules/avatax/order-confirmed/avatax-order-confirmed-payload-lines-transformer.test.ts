import { describe, expect, it } from "vitest";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";

const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
const matches: AvataxTaxCodeMatches = [];

describe("AvataxOrderConfirmedPayloadLinesTransformer", () => {
  describe.each([
    {
      taxIncluded: false,
      scenario: "default",
      shippingAmount: 50,
      firstProductAmount: 60,
      secondProductAmount: 20,
      thirdProductAmount: 100,
    },
    {
      taxIncluded: true,
      scenario: "withTaxIncluded",
      shippingAmount: 59.17,
      firstProductAmount: 65.18,
      secondProductAmount: 21.73,
      thirdProductAmount: 108.63,
    },
  ] as const)(
    `should transform the order with tax included: $taxIncluded`,
    ({
      taxIncluded,
      scenario,
      shippingAmount,
      firstProductAmount,
      secondProductAmount,
      thirdProductAmount,
    }) => {
      const mockGenerator = new AvataxOrderConfirmedMockGenerator(scenario);
      const orderMock = mockGenerator.generateOrder();
      const lines = linesTransformer.transform(orderMock, avataxConfigMock, matches);
      const [firstProductLine, secondProductLine, thirdProductLine, shippingLine] = lines;

      it("returns the correct number of lines", () => {
        expect(lines).toHaveLength(4);
      });

      it("includes shipping as a line", () => {
        expect(shippingLine).toEqual({
          itemCode: "Shipping",
          taxCode: "FR000000",
          quantity: 1,
          amount: shippingAmount,
          taxIncluded: taxIncluded,
          discounted: false,
        });
      });

      it("includes products as lines", () => {
        expect(firstProductLine).toStrictEqual(
          expect.objectContaining({
            itemCode: "328223580",
            description: "Monospace Tee",
            quantity: 3,
            amount: firstProductAmount,
            taxIncluded: taxIncluded,
            discounted: false,
            taxCode: "",
          }),
        );
        expect(secondProductLine).toStrictEqual(
          expect.objectContaining({
            itemCode: "328223581",
            description: "Monospace Tee",
            quantity: 1,
            amount: secondProductAmount,
            taxIncluded: taxIncluded,
            discounted: false,
            taxCode: "",
          }),
        );
        expect(thirdProductLine).toStrictEqual(
          expect.objectContaining({
            itemCode: "118223581",
            description: "Paul's Balance 420",
            quantity: 2,
            amount: thirdProductAmount,
            taxIncluded: taxIncluded,
            discounted: false,
            taxCode: "",
          }),
        );
      });
    },
  );
});
