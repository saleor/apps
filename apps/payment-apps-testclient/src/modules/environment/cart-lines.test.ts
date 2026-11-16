import { describe, expect, it } from "vitest";

import {
  availableVariants,
  type CartProduct,
  checkoutLinesSchema,
  prefillCart,
} from "./cart-lines";

const product = (id: string, stock: number | null = 10): CartProduct => ({
  id,
  variants: [
    {
      id: `${id}-variant`,
      quantityAvailable: stock,
      pricing: { price: { gross: { amount: 10, currency: "USD" } } },
    },
  ],
});

describe("checkout cart prefilling", () => {
  it("prefers two distinct products with different quantities", () => {
    expect(prefillCart([product("one"), product("two"), product("three")])).toStrictEqual([
      { variantId: "one-variant", quantity: 2 },
      { variantId: "two-variant", quantity: 1 },
    ]);
  });

  it("uses an available variant even when the product has no usable default variant", () => {
    const item = product("one");

    expect(
      availableVariants({
        ...item,
        variants: [
          {
            id: "sold-out",
            quantityAvailable: 0,
            pricing: { price: { gross: { amount: 10, currency: "USD" } } },
          },
          { id: "unpriced", quantityAvailable: 10, pricing: null },
          ...item.variants!,
        ],
      }).map((variant) => variant.id),
    ).toStrictEqual(["one-variant"]);
  });

  it("caps the first quantity to stock and works with only one product", () => {
    expect(prefillCart([product("one", 1)])).toStrictEqual([
      { variantId: "one-variant", quantity: 1 },
    ]);
  });

  it("treats null quantity as unlimited and skips unavailable products", () => {
    expect(prefillCart([product("empty", 0), product("unlimited", null)])).toStrictEqual([
      { variantId: "unlimited-variant", quantity: 2 },
    ]);
    expect(prefillCart([{ id: "no-variants", variants: null }])).toStrictEqual([]);
  });

  it.each(
    [
      [],
      [{ variantId: "v", quantity: 0 }],
      [{ variantId: "v", quantity: -1 }],
      [{ variantId: "v", quantity: 1.5 }],
      [
        { variantId: "v", quantity: 1 },
        { variantId: "v", quantity: 2 },
      ],
    ].map((lines) => ({ lines })),
  )("rejects invalid checkout lines %j", ({ lines }) => {
    expect(checkoutLinesSchema.safeParse(lines).success).toBe(false);
  });
});
