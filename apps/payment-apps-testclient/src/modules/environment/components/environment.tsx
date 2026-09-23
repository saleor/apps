"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
});

type EnvironmentConfigSchemaType = z.infer<typeof EnvironmentConfigSchema>;

export const Environment = () => {
  const [products, setProducts] = useState<FragmentOf<typeof ProductFragment>[]>([]);

  const form = useForm<EnvironmentConfigSchemaType>({
    resolver: zodResolver(EnvironmentConfigSchema),
    defaultValues: {
      url: resolveEnvUrl(),
      channelSlug: resolveChannelSlug(),
    },
  });

  const onSubmit = async (data: EnvironmentConfigSchemaType) => {
    saveEnvUrlToLocalStorage(data.url);
    saveChannelSlugToLocalStorage(data.channelSlug);
    const response = await fetchProduct({
      channelSlug: data.channelSlug,
      envUrl: data.url,
    });

    if (response?.data) {
      setProducts(response?.data?.products?.edges.map((e) => e.node) ?? []);
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

      {products.length > 0 && (
        <Cart
          data={products}
          envUrl={form.getValues().url}
          channelSlug={form.getValues().channelSlug}
        />
      )}
    </>
  );
};
