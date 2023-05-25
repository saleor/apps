import { expect, describe, it } from "vitest";
import { SHIPPING_ITEM_CODE } from "./avatax-calculate-taxes-adapter";
import { mapPayloadLines } from "./avatax-calculate-taxes-payload-transformer";
import { avataxMockFactory } from "../avatax-mock-factory";
import { taxMockFactory } from "../../taxes/tax-mock-factory";

const mapPayloadArgsMocks = {
  channel: avataxMockFactory.createMockChannelConfig(),
  taxBase: taxMockFactory.createMockTaxBase("no_discounts"),
  config: avataxMockFactory.createMockAvataxConfig(),
};

describe("mapPayloadLines", () => {
  const lines = mapPayloadLines(mapPayloadArgsMocks.taxBase, mapPayloadArgsMocks.config);

  it("includes shipping as a line", () => {
    expect(lines).toContainEqual({
      itemCode: SHIPPING_ITEM_CODE,
      quantity: 1,
      amount: 48.33,
      taxCode: mapPayloadArgsMocks.config.shippingTaxCode,
      taxIncluded: false,
    });
  });

  it("returns the correct quantity of individual lines", () => {
    expect(lines).toContainEqual({
      quantity: 3,
      amount: 252,
      taxCode: "",
      taxIncluded: false,
    });
  });
});
