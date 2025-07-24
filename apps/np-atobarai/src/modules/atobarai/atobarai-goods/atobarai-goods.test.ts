import { describe, expect, it } from "vitest";

import { AtobaraiGoods } from "./atobarai-goods";

describe("AtobaraiGoods", () => {
  it("shouldn't be assignable without good builder", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiGoods = [{ goods_name: "Test", goods_price: 100, quantity: 1 }];

    expect(testValue).toBeDefined();
  });
});
