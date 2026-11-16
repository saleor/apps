"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButton } from "@/components/form-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { clearIdempotencyKey } from "@/lib/idempotency-key";
import { createPath } from "@/lib/utils";

import { fetchProduct } from "../actions/fetch-product";
import { type ProductFragment } from "../fragments";
import { Cart } from "./cart";
import {
  resolveChannelSlug,
  resolveEnvUrl,
  saveChannelSlugToLocalStorage,
  saveEnvUrlToLocalStorage,
} from "./storage-helpers";

const EnvironmentConfigSchema = z.object({
  url: envUrlSchema,
  channelSlug: z.string().min(1),
  search: z.string().optional(),
});

type EnvironmentConfigSchemaType = z.infer<typeof EnvironmentConfigSchema>;

export const Environment = () => {
  const router = useRouter();
  const [existingCheckout, setExistingCheckout] = useState("");
  const [catalog, setCatalog] = useState<{
    url: string;
    channelSlug: string;
    search?: string;
    cursor?: string | null;
    hasNext: boolean;
    revision: number;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState<FragmentOf<typeof ProductFragment>[]>([]);

  const form = useForm<EnvironmentConfigSchemaType>({
    resolver: zodResolver(EnvironmentConfigSchema),
    defaultValues: {
      url: resolveEnvUrl(),
      channelSlug: resolveChannelSlug(),
      search: "",
    },
  });

  const onSubmit = async (data: EnvironmentConfigSchemaType) => {
    saveEnvUrlToLocalStorage(data.url);
    saveChannelSlugToLocalStorage(data.channelSlug);
    const response = await fetchProduct({
      channelSlug: data.channelSlug,
      envUrl: data.url,
      search: data.search,
    });

    if (response?.data) {
      setProducts(response.data.products?.edges.map((e) => e.node) ?? []);
      setCatalog({
        ...data,
        cursor: response.data.products?.pageInfo.endCursor,
        hasNext: response.data.products?.pageInfo.hasNextPage ?? false,
        revision: (catalog?.revision ?? 0) + 1,
      });
      toast({
        title: "Successfully fetched products",
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 md:gap-8">
        <h2 className="mb-2 text-2xl font-bold">Environment Information</h2>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment URL (ending with /graphql/)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your env url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="channelSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your channel slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product search (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name or SKU" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                type="reset"
                onClick={() => {
                  clearIdempotencyKey();
                  toast({
                    title: "Successfully cleared idempotency key",
                  });
                }}
              >
                Clear idempotency key
              </Button>

              <FormButton
                type="submit"
                variant="secondary"
                className="justify-self-end"
                loading={form.formState.isSubmitting}
              >
                Fetch products
              </FormButton>
            </div>
          </form>
        </Form>
      </div>

      <section aria-labelledby="checkout-heading" className="grid content-start gap-4">
        <h2 id="checkout-heading" className="mb-2 text-2xl font-bold">
          Checkout
        </h2>
        <div className="flex items-end gap-3">
          <label className="grid flex-1 gap-2">
            Existing checkout ID
            <Input
              value={existingCheckout}
              onChange={(event) => setExistingCheckout(event.target.value)}
            />
          </label>
          <Button
            variant="secondary"
            disabled={!existingCheckout.trim()}
            onClick={form.handleSubmit((data) =>
              router.push(
                createPath(
                  "/env",
                  encodeURIComponent(data.url),
                  "checkout",
                  encodeURIComponent(existingCheckout.trim()),
                ),
              ),
            )}
          >
            Open checkout
          </Button>
        </div>
        {products.length > 0 && catalog && (
          <Cart
            key={catalog.revision}
            data={products}
            envUrl={catalog.url}
            channelSlug={catalog.channelSlug}
          />
        )}
        {catalog?.hasNext ? (
          <FormButton
            loading={loadingMore}
            variant="outline"
            className="mt-4"
            onClick={async () => {
              setLoadingMore(true);
              try {
                const response = await fetchProduct({
                  envUrl: catalog.url,
                  channelSlug: catalog.channelSlug,
                  search: catalog.search,
                  after: catalog.cursor ?? undefined,
                });

                if (response?.data?.products) {
                  setProducts((current) => [
                    ...current,
                    ...response.data!.products!.edges.map((edge) => edge.node),
                  ]);
                  setCatalog({
                    ...catalog,
                    cursor: response.data.products.pageInfo.endCursor,
                    hasNext: response.data.products.pageInfo.hasNextPage,
                  });
                }
              } finally {
                setLoadingMore(false);
              }
            }}
          >
            Load more products
          </FormButton>
        ) : null}
      </section>
    </>
  );
};
