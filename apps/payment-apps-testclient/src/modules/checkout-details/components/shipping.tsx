"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

import { FormButton } from "@/components/form-button";
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
import { type FragmentOf, readFragment } from "@/graphql/gql";

import { updateShippingAddress } from "../actions/update-shipping-address";
import { getDefaultAddressByCountryCode } from "../address";
import { convertStringToCountryCode } from "../countries";
import { ShippingAddressFragment } from "../fragments/shipping";
import { ShippingAddressSchema } from "../schemas/shipping-address";

export type ShippingAddressSchemaType = z.infer<typeof ShippingAddressSchema>;

export const Shipping = (props: {
  data: FragmentOf<typeof ShippingAddressFragment> | null | undefined;
  envUrl: string;
  checkoutId: string;
}) => {
  const { data, envUrl, checkoutId } = props;

  const address = readFragment(ShippingAddressFragment, data);
  const defaultAddress = getDefaultAddressByCountryCode();

  const form = useForm<ShippingAddressSchemaType>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: {
      firstName: address?.firstName ?? defaultAddress.firstName,
      lastName: address?.lastName ?? defaultAddress.lastName,
      streetAddress1: address?.streetAddress1 ?? defaultAddress.streetAddress1,
      city: address?.city ?? defaultAddress.city,
      countryArea: address?.countryArea ?? defaultAddress.countryArea,
      country: convertStringToCountryCode(address?.country.code) ?? defaultAddress.country,
      postalCode: address?.postalCode ?? defaultAddress.postalCode,
    },
  });

  const onSubmit = async (data: ShippingAddressSchemaType) => {
    const response = await updateShippingAddress({
      envUrl,
      checkoutId,
      shippingAddress: data,
    });

    if (response?.data) {
      toast({
        title: "Successfully updated shipping address",
      });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Shipping Information</h2>
      <Form {...form}>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="streetAddress1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="countryArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your state" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid">
            <FormButton
              type="submit"
              variant="secondary"
              className="justify-self-end"
              loading={form.formState.isSubmitting}
            >
              Save shipping address
            </FormButton>
          </div>
        </form>
      </Form>
    </div>
  );
};
