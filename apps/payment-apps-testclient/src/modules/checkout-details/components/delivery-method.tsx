"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormButton } from "@/components/form-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { type FragmentOf, readFragment } from "@/graphql/gql";

import { updateDeliveryMethod } from "../actions/update-delivery-method";
import {
  type CollectionPointFragment,
  DeliveryMethodFragment,
  ShippingMethodFragment,
} from "../fragments/delivery-method";

const DeliveryMethodSchema = z.object({
  deliveryMethodId: z.string(),
});

type DeliveryMethodSchemaType = z.infer<typeof DeliveryMethodSchema>;

export const DeliveryMethod = (props: {
  deliveryMethodData:
    | FragmentOf<typeof DeliveryMethodFragment>
    | FragmentOf<typeof CollectionPointFragment>
    | null
    | undefined;
  shippingMethodData: FragmentOf<typeof ShippingMethodFragment>[] | null | undefined;
  envUrl: string;
  checkoutId: string;
}) => {
  const { deliveryMethodData, shippingMethodData, envUrl, checkoutId } = props;

  const shippingMethods = readFragment(
    ShippingMethodFragment,
    shippingMethodData?.map((method) => method) ?? [],
  );

  const deliveryMethod = readFragment(DeliveryMethodFragment, deliveryMethodData);

  const getDefaultDeliveryMethodId = () => {
    // if deliveryMethod is already set, return its id
    if (deliveryMethod) {
      // @ts-expect-error - `id` is not present on every delivery method union member
      return deliveryMethod.id;
    }
    // if there is only one shipping method, return its id
    if (shippingMethods.length === 1) {
      return shippingMethods[0]?.id;
    }

    // otherwise, return empty string
    return "";
  };

  const form = useForm<DeliveryMethodSchemaType>({
    resolver: zodResolver(DeliveryMethodSchema),
    defaultValues: {
      deliveryMethodId: getDefaultDeliveryMethodId(),
    },
  });

  async function onSubmit(data: DeliveryMethodSchemaType) {
    const response = await updateDeliveryMethod({
      envUrl,
      checkoutId,
      deliveryMethod: data.deliveryMethodId,
    });

    if (response?.data) {
      toast({
        title: "Successfully updated delivery method",
      });
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold">Delivery Method Information</h2>
      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
            <FormField
              control={form.control}
              name="deliveryMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a delivery method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shippingMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid">
              <FormButton
                type="submit"
                className="justify-self-end"
                loading={form.formState.isSubmitting}
              >
                Submit
              </FormButton>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};
