import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

import { SaleorProviderFieldsMappingKeys } from "@/modules/configuration";
import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";

import { printSaleorProductFields } from "../../configuration/print-saleor-product-fields";
import { trpcClient } from "../../trpc/trpc-client";

type FormShape = Omit<PayloadCmsProviderConfig.InputShape, "type">;

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

/*
 * todo react on token change, refresh mutation
 */
const PureForm = ({ defaultValues, onSubmit, onDelete }: PureFormProps) => {
  const { notifyError } = useDashboardNotification();

  const { control, getValues, setValue, watch, handleSubmit, clearErrors, setError } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(PayloadCmsProviderConfig.Schema.Input.omit({ type: true })),
  });

  return (
    <Box
      as="form"
      display={"grid"}
      gap={4}
      onSubmit={handleSubmit((vals) => {
        onSubmit(vals);
      })}
    >
      <Input
        required
        control={control}
        name="configName"
        label="Configuration name"
        helperText="Meaningful name that will help you understand it later. E.g. 'staging' or 'prod' "
      />
      <Box display={"grid"} gap={4} marginY={4}>
        <Text size={5} fontWeight="bold">
          Provide connection details
        </Text>
        <Input
          required
          control={control}
          name="payloadApiUrl"
          type="url"
          label="API url"
          helperText="URL where Payload API is available. By default ends with /api"
        />

        <Box
          backgroundColor="default1"
          borderColor="default1"
          borderWidth={1}
          borderStyle={"solid"}
          padding={4}
          borderRadius={4}
        >
          <Text size={5} fontWeight="bold" as="h1" marginBottom={4}>
            Authorization
          </Text>
          <Text marginBottom={2} as="p">
            Payload can be configured to have open operations (not recommended) or to require an API
            key. Key can be generated per user. To authenticate, you need to provide both user slug
            and the key itself.{" "}
          </Text>
          <TextLink
            marginBottom={2}
            display="block"
            newTab
            href="https://payloadcms.com/docs/authentication/config"
          >
            Read more in Payload docs
          </TextLink>
          <Text as="p" marginBottom={6}>
            If your API is open (e.g. for development purposes) leave both fields empty.
          </Text>

          <Box display="grid" gap={4} gridTemplateColumns={2}>
            <Input
              control={control}
              name="authenticatedUserSlug"
              label="Authenticated user slug"
              placeholder="e.g. apps"
            />
            <Input control={control} name="authToken" type="password" label="User API Key" />
          </Box>
        </Box>
      </Box>
      <Box display={"grid"} gap={4} marginY={4}>
        <Text size={5} fontWeight="bold">
          Configure fields mapping
        </Text>
        <Input
          label="Collection Slug"
          name="collectionName"
          control={control}
          helperText="Slug of your collection in Payload, e.g. 'saleorVariants'"
        />

        <React.Fragment>
          <Text as="p" size={4} fontWeight="bold">
            Map fields from Saleor to your Payload schema.
          </Text>
          <Text as="p" marginTop={2} marginBottom={4}>
            All fields should be type of{" "}
            <Text size={4} fontWeight="bold">
              Text
            </Text>
            . Channels should be type of{" "}
            <Text size={4} fontWeight="bold">
              JSON
            </Text>
            .
          </Text>
          <Box
            marginBottom={4}
            display="grid"
            __gridTemplateColumns={"50% 50%"}
            borderBottomWidth={1}
            borderBottomStyle="solid"
            borderColor="default1"
            padding={2}
          >
            <Text size={2}>Saleor Field</Text>
            <Text size={2}>Payload field</Text>
          </Box>
          {SaleorProviderFieldsMappingKeys.map((saleorField) => (
            // todo extract this table to component
            <Box
              display="grid"
              __gridTemplateColumns={"50% 50%"}
              padding={2}
              key={saleorField}
              alignItems="center"
            >
              <Box>
                <Text as="p" size={4} fontWeight="bold">
                  {printSaleorProductFields(saleorField)}
                </Text>
                <Text size={2}>{saleorField === "channels" ? "JSON field" : "Text field"}</Text>
              </Box>
              <Input
                size="small"
                control={control}
                name={`productVariantFieldsMapping.${saleorField}`}
                label="CMS Field"
              />
            </Box>
          ))}
        </React.Fragment>
      </Box>

      <ButtonsBox>
        {onDelete && (
          <Button onClick={onDelete} variant="tertiary">
            Delete
          </Button>
        )}
        <Button type="submit">Save</Button>
      </ButtonsBox>
    </Box>
  );
};

const AddFormVariant = () => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.providersConfigs.addOne.useMutation({
    onSuccess() {
      notifySuccess("Success", "Added new configuration");
      push("/configuration");
    },
  });

  return (
    <PureForm
      onSubmit={(values) => {
        mutate({
          ...values,
          type: "payloadcms",
        });
      }}
      defaultValues={{
        payloadApiUrl: "",
        authToken: "",
        configName: "",
        collectionName: "",
        authenticatedUserSlug: "",
        productVariantFieldsMapping: {
          channels: "",
          variantName: "",
          productId: "",
          productName: "",
          productSlug: "",
          variantId: "",
        },
      }}
    />
  );
};

const EditFormVariant = (props: { configId: string }) => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { data } = trpcClient.providersConfigs.getOne.useQuery(
    {
      id: props.configId,
    },
    {
      enabled: !!props.configId,
    },
  );

  const { mutate } = trpcClient.providersConfigs.updateOne.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated configuration");
      push("/configuration");
    },
  });

  const { mutate: deleteProvider } = trpcClient.providersConfigs.deleteOne.useMutation({
    onSuccess() {
      notifySuccess("Success", "Removed configuration");
      push("/configuration");
    },
  });

  if (!data) {
    return null;
  }

  if (data.type !== "payloadcms") {
    throw new Error("Trying to fill Payload CMS form with non Payload CMS data");
  }

  return (
    <PureForm
      onDelete={() => {
        deleteProvider({
          id: props.configId,
        });
      }}
      onSubmit={(values) => {
        mutate({
          ...values,
          type: "payloadcms",
          id: props.configId,
        });
      }}
      defaultValues={data}
    />
  );
};

export const PayloadCMSConfigForm = {
  PureVariant: PureForm,
  AddVariant: AddFormVariant,
  EditVariant: EditFormVariant,
};
