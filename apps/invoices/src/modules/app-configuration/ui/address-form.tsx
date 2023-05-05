import { SellerShopConfig } from "../schema-v1/app-config";
import { Controller, useForm } from "react-hook-form";

import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Input, InputProps, Text, Button, Box } from "@saleor/macaw-ui/next";
import { SellerAddress } from "../address";
import { trpcClient } from "../../trpc/trpc-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";

type Props = {
  channelSlug: string;
};

const FormSchema = z.object({
  city: z.string().min(1),
  cityArea: z.string(),
  companyName: z.string().min(1),
  country: z.string().min(1),
  streetAddress1: z.string().min(1),
  streetAddress2: z.string().min(1),
  countryArea: z.string(),
  postalCode: z.string().min(1),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const fieldsBlock1: Array<keyof FormSchemaType> = [
  "companyName",
  "streetAddress1",
  "streetAddress2",
];
const fieldsBlock2: Array<keyof FormSchemaType> = ["postalCode", "city"];
const fieldsBlock3: Array<keyof FormSchemaType> = ["cityArea", "country", "countryArea"];

const fieldLabels: Record<keyof FormSchemaType, string> = {
  countryArea: "Country Area",
  country: "Country",
  cityArea: "City Area",
  streetAddress2: "Street Address 2",
  streetAddress1: "Street Address 1",
  companyName: "Company Name",
  city: "City",
  postalCode: "Postal Code",
};

export const AddressForm = (props: Props) => {
  const { push } = useRouter();

  const channelOverrideConfigQuery =
    trpcClient.appConfigurationV2.fetchChannelsOverrides.useQuery();

  const upsertConfigMutation = trpcClient.appConfigurationV2.upsertChannelOverride.useMutation();

  const { handleSubmit, formState, control, setValue } = useForm<SellerAddress>({
    defaultValues: channelOverrideConfigQuery.data ?? {
      city: "",
      postalCode: "",
      country: "",
      streetAddress2: "",
      streetAddress1: "",
      companyName: "",
      cityArea: "",
      countryArea: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const { notifySuccess } = useDashboardNotification();

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        return upsertConfigMutation
          .mutateAsync({
            address: data,
            channelSlug: props.channelSlug,
          })
          .then(() => {
            notifySuccess("Success", "Updated channel configuration");

            push("/configuration");
          });
      })}
    >
      <Box display={"grid"} gap={6} marginBottom={12}>
        {fieldsBlock1.map((fieldName) => (
          <Controller
            key={fieldName}
            control={control}
            render={({ field: { onChange, onBlur, value, name, ref } }) => {
              return (
                <Input
                  onChange={onChange}
                  value={value}
                  error={!!formState.errors[fieldName]}
                  label={fieldLabels[fieldName]}
                  onBlur={onBlur}
                  name={name}
                  ref={ref}
                />
              );
            }}
            name={fieldName}
          />
        ))}

        <Box display={"grid"} gridTemplateColumns={2} gap={6}>
          {fieldsBlock2.map((fieldName) => (
            <Controller
              key={fieldName}
              control={control}
              render={({ field: { onChange, onBlur, value, name, ref } }) => {
                return (
                  <Input
                    onChange={onChange}
                    value={value}
                    error={!!formState.errors[fieldName]}
                    label={fieldLabels[fieldName]}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                  />
                );
              }}
              name={fieldName}
            />
          ))}
        </Box>

        {fieldsBlock3.map((fieldName) => (
          <Controller
            key={fieldName}
            control={control}
            render={({ field: { onChange, onBlur, value, name, ref } }) => {
              return (
                <Input
                  onChange={onChange}
                  value={value}
                  error={!!formState.errors[fieldName]}
                  label={fieldLabels[fieldName]}
                  onBlur={onBlur}
                  name={name}
                  ref={ref}
                />
              );
            }}
            name={fieldName}
          />
        ))}
      </Box>
      <Box display={"grid"} justifyContent={"flex-end"} gap={4} gridAutoFlow={"column"}>
        <Button
          variant="tertiary"
          onClick={(e) => {
            e.stopPropagation();
            push("/configuration");
          }}
        >
          <Text color={"textNeutralSubdued"}>Cancel</Text>
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Box>
    </form>
  );
};
