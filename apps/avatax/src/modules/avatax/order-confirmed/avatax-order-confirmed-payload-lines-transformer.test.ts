import { describe, expect, it } from "vitest";
import { defaultOrder } from "../../../mocks";
import { SaleorMockOrderFactory } from "../../saleor/mock-order-factory";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedMockGenerator } from "./avatax-order-confirmed-mock-generator";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";

const linesTransformer = new AvataxOrderConfirmedPayloadLinesTransformer();
const mockGenerator = new AvataxOrderConfirmedMockGenerator();
const orderMock = mockGenerator.generateOrder();

const matches: AvataxTaxCodeMatches = [];

describe("AvataxOrderConfirmedPayloadLinesTransformer", () => {
  describe.each([
    {
      pricesEnteredWithTax: true,
      firstProductAmount: defaultOrder.lines[0].totalPrice.gross.amount,
      secondProductAmount: defaultOrder.lines[1].totalPrice.gross.amount,
      thirdProductAmount: defaultOrder.lines[2].totalPrice.gross.amount,
      shippingAmount: defaultOrder.shippingPrice.gross.amount,
    },
    {
      pricesEnteredWithTax: false,
      firstProductAmount: defaultOrder.lines[0].totalPrice.net.amount,
      secondProductAmount: defaultOrder.lines[1].totalPrice.net.amount,
      thirdProductAmount: defaultOrder.lines[2].totalPrice.net.amount,
      shippingAmount: defaultOrder.shippingPrice.net.amount,
    },
  ])(
    `should tranform the order with pricesEnteredWithTax: $pricesEnteredWithTax`,
    ({
      pricesEnteredWithTax,
      firstProductAmount,
      secondProductAmount,
      thirdProductAmount,
      shippingAmount,
    }) => {
      const saleorOrderMock = SaleorMockOrderFactory.create({ pricesEnteredWithTax });

      const lines = linesTransformer.transform(
        orderMock,
        saleorOrderMock,
        avataxConfigMock,
        matches,
      );
      const [first, second, third, shipping] = lines;

      it("returns the correct number of lines", () => {
        expect(lines).toHaveLength(4);
      });

      it("includes shipping as a line", () => {
        expect(shipping).toEqual({
          itemCode: "Shipping",
          taxCode: "FR000000",
          quantity: 1,
          amount: shippingAmount,
          taxIncluded: pricesEnteredWithTax,
          discounted: false,
        });
      });

      it("includes products as lines", () => {
        expect(first).toEqual({
          itemCode: "328223580",
          discounted: false,
          description: "Monospace Tee",
          quantity: 3,
          amount: firstProductAmount,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: pricesEnteredWithTax,
        });
        expect(second).toEqual({
          itemCode: "dmFyaWFudC1pZA==",
          description: "Monospace Tee",
          quantity: 1,
          amount: secondProductAmount,
          discounted: false,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: pricesEnteredWithTax,
        });
        expect(third).toEqual({
          itemCode: "118223581",
          description: "Paul's Balance 420",
          quantity: 2,
          amount: thirdProductAmount,
          discounted: false,
          taxCode: DEFAULT_TAX_CLASS_ID,
          taxIncluded: pricesEnteredWithTax,
        });
      });
    },
  );
});
