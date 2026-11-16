"use client";

import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

import { FormButton } from "@/components/form-button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf, readFragment } from "@/graphql/gql";

import { createCheckout } from "../actions/create-checkout";
import { availableVariants, type CartLine, checkoutLinesSchema, prefillCart } from "../cart-lines";
import { ProductFragment } from "../fragments";

export const Cart = ({
  data,
  envUrl,
  channelSlug,
}: {
  data: FragmentOf<typeof ProductFragment>[];
  envUrl: string;
  channelSlug: string;
}) => {
  const products = data.map((product) => readFragment(ProductFragment, product));
  const [lines, setLines] = useState<CartLine[]>(() => prefillCart(products));
  const [pending, setPending] = useState(false);
  const updateQuantity = (variantId: string, quantity: number) =>
    setLines((current) => [
      ...current.filter((line) => line.variantId !== variantId),
      ...(quantity > 0 ? [{ variantId, quantity }] : []),
    ]);

  const onCreate = async () => {
    const parsed = checkoutLinesSchema.safeParse(lines);

    if (!parsed.success) return;
    setPending(true);
    try {
      const response = await createCheckout({ envUrl, channelSlug, lines: parsed.data });

      if (response?.validationErrors || response?.serverError) {
        toast({
          title: "Could not create checkout",
          description: "Check the selected quantities and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      unstable_rethrow(error);
      toast({
        title: "Could not create checkout",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="grid gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Two products are selected when available. Adjust quantities below; use zero to leave a
          variant out.
        </p>
      </div>
      {products.map((product) => (
        <div key={product.id} className="grid gap-3 rounded-md border p-4">
          <div className="flex items-center gap-3">
            {product.thumbnail?.url ? (
              <Image
                src={product.thumbnail.url}
                alt={product.name}
                width={48}
                height={48}
                className="rounded border"
              />
            ) : null}
            <h3 className="font-medium">{product.name}</h3>
          </div>
          {availableVariants(product).length === 0 ? (
            <p className="text-sm text-muted-foreground">No priced, in-stock variants.</p>
          ) : null}
          {availableVariants(product).map((variant) => {
            const details = product.variants?.find((item) => item.id === variant.id);
            const quantity = lines.find((line) => line.variantId === variant.id)?.quantity ?? 0;

            return (
              <label key={variant.id} className="flex items-center justify-between gap-4">
                <span>
                  {details?.name || product.name}{" "}
                  <span className="text-sm text-muted-foreground">
                    {variant.pricing?.price?.gross.amount} {variant.pricing?.price?.gross.currency}
                  </span>
                </span>
                <Input
                  className="w-24"
                  aria-label={`Quantity for ${product.name} ${details?.name ?? ""}`}
                  type="number"
                  min={0}
                  max={variant.quantityAvailable ?? undefined}
                  step={1}
                  value={quantity}
                  disabled={pending}
                  onChange={(event) => {
                    const next = Number(event.target.value);

                    if (
                      Number.isInteger(next) &&
                      next >= 0 &&
                      (variant.quantityAvailable === null || next <= variant.quantityAvailable)
                    )
                      updateQuantity(variant.id, next);
                  }}
                />
              </label>
            );
          })}
        </div>
      ))}
      <FormButton
        onClick={onCreate}
        className="justify-self-end"
        loading={pending}
        disabled={!checkoutLinesSchema.safeParse(lines).success}
      >
        Create checkout ({lines.length} variants)
      </FormButton>
    </section>
  );
};
