import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, Layout, SkeletonLayout } from "@saleor/apps-ui";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";
import { SellerAddress } from "../address";
import { AddressV2Schema, AddressV2Shape } from "../schema-v2/app-config-schema.v2";

type Props = {
  channelSlug: string;
};

type InnerFormProps = {
  address: AddressV2Shape;
  onSubmit(fields: AddressV2Shape): Promise<void>;
  onCancel(): void;
};

/**
 * Use the same form structure as metadata to avoid mapping and distributed validation.
 * If extra rules are needed, it can be separated and mapped
 */
const FormSchema = AddressV2Schema;

type FormSchemaType = z.infer<typeof FormSchema>;

/**
 * Divide fields into blocks to make it easier to create a form layout
 */
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

export const AddressForm = (props: Props & InnerFormProps) => {
  const { handleSubmit, formState, control, reset } = useForm<SellerAddress>({
    defaultValues: props.address,
    resolver: zodResolver(FormSchema),
  });

  return (
    <Layout.AppSectionCard
      as="form"
      footer={
        <ButtonsBox>
          <Button
            variant="tertiary"
            onClick={(e) => {
              e.stopPropagation();
              props.onCancel();
            }}
          >
            <Text color={"textNeutralSubdued"}>Cancel</Text>
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </ButtonsBox>
      }
      onSubmit={handleSubmit((data, event) => {
        return props.onSubmit(data);
      })}
    >
      <Box display={"grid"} gap={3}>
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

        <Box display={"grid"} gridTemplateColumns={2} gap={3}>
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
    </Layout.AppSectionCard>
  );
};

export const ConnectedAddressForm = (props: Props) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const channelOverrideConfigQuery = trpcClient.appConfiguration.fetchChannelsOverrides.useQuery();

  const upsertConfigMutation = trpcClient.appConfiguration.upsertChannelOverride.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated channel configuration");

      push("/configuration");
    },
    onError() {
      notifyError("Error", "Failed to save configuration");
    },
  });

  const { push } = useRouter();

  const submitHandler = useCallback(
    async (data: AddressV2Shape) => {
      return upsertConfigMutation.mutate({
        address: data,
        channelSlug: props.channelSlug,
      });
    },
    [props.channelSlug, upsertConfigMutation],
  );

  const onCancelHandler = useCallback(() => {
    push("/configuration");
  }, [push]);

  if (channelOverrideConfigQuery.isLoading) {
    return <SkeletonLayout.Section />;
  }

  return (
    <AddressForm
      onCancel={onCancelHandler}
      onSubmit={submitHandler}
      address={channelOverrideConfigQuery.data![props.channelSlug]}
      channelSlug={props.channelSlug}
    />
  );
};
