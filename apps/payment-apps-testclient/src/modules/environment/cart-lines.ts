import { z } from "zod";

export const checkoutLinesSchema = z
  .array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  )
  .min(1, "Choose at least one variant.")
  .refine(
    (lines) => new Set(lines.map((line) => line.variantId)).size === lines.length,
    "Each variant may appear only once.",
  );
export type CartLine = z.infer<typeof checkoutLinesSchema>[number];
export type CartProduct = {
  id: string;
  variants:
    | readonly {
        id: string;
        quantityAvailable: number | null;
        pricing: { price: { gross: { amount: number; currency: string } } | null } | null;
      }[]
    | null;
};

export const availableVariants = (product: CartProduct) =>
  (product.variants ?? []).filter(
    (variant) =>
      variant.pricing?.price &&
      (variant.quantityAvailable === null || variant.quantityAvailable > 0),
  );

// Prefer two different products. Null quantity means unlimited, not out of stock.
export const prefillCart = (products: readonly CartProduct[]): CartLine[] => {
  const variants = products
    .flatMap((product) => availableVariants(product).slice(0, 1))
    .slice(0, 2);

  return variants.map((variant, index) => ({
    variantId: variant.id,
    quantity: index === 0 ? Math.min(2, variant.quantityAvailable ?? 2) : 1,
  }));
};
