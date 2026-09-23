"use client";

import Image from "next/image";
import { useTransition } from "react";

import { FormButton } from "@/components/form-button";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf, readFragment } from "@/graphql/gql";

import { createCheckout } from "../actions/create-checkout";
import { ProductFragment } from "../fragments";

export const Cart = (props: {
  data: FragmentOf<typeof ProductFragment>[];
  envUrl: string;
  channelSlug: string;
}) => {
  const [isPending, startTransition] = useTransition();

  const { envUrl, channelSlug, data } = props;
  const products = data.map((product) => readFragment(ProductFragment, product));

  const onClick = async () => {
    startTransition(async () => {
      const response = await createCheckout({
        envUrl,
        channelSlug,
        variantId: products[0]?.defaultVariant?.id ?? "",
      });

      if (response?.data) {
        toast({
          title: "Successfully created checkout",
        });
      }
    });
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Cart</h2>
      <div className="grid gap-4">
        {products?.map((product) => (
          <div key={product.id} className="grid grid-cols-[80px_1fr_80px] items-center gap-4">
            <Image
              src={product.thumbnail?.url ?? ""}
              alt="Alt"
              width={80}
              height={80}
              className="aspect-square overflow-hidden rounded-lg border object-cover"
            />
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category?.name}</p>
            </div>
            <div className="text-right">
              <div>Qty: 1</div>
              <div>
                {product.defaultVariant?.pricing?.price?.gross.amount}{" "}
                {product.defaultVariant?.pricing?.price?.gross.currency}
              </div>
            </div>
          </div>
        ))}
        <div className="grid">
          <FormButton
            type="submit"
            onClick={onClick}
            className="justify-self-end"
            loading={isPending}
          >
            Create checkout
          </FormButton>
        </div>
      </div>
    </div>
  );
};
