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

import { updateBillingAddress } from "../actions/update-billing-address";
import { getDefaultAddressByCountryCode } from "../address";
import { convertStringToCountryCode } from "../countries";
import { BillingAddressFragment } from "../fragments/billing-address";
import { BillingAddressSchema } from "../schemas/billing-address";

export type BillingAddressSchemaType = z.infer<typeof BillingAddressSchema>;

export const Billing = (props: {
  data: FragmentOf<typeof BillingAddressFragment> | undefined | null;
  envUrl: string;
  checkoutId: string;
}) => {
  const { data, envUrl, checkoutId } = props;

  const address = readFragment(BillingAddressFragment, data);
  const defaultAddress = getDefaultAddressByCountryCode();

  const form = useForm<BillingAddressSchemaType>({
    resolver: zodResolver(BillingAddressSchema),
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

  const onSubmit = async (data: BillingAddressSchemaType) => {
    const response = await updateBillingAddress({
      envUrl,
      checkoutId,
      billingAddress: data,
    });

    if (response?.validationErrors) {
      toast({
        title: "Validation error",
        variant: "destructive",
      });
    }

    if (response?.data) {
      toast({
        title: "Successfully updated billing address",
      });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Billing Information</h2>
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
              Save billing address
            </FormButton>
          </div>
        </form>
      </Form>
    </div>
  );
};
