import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useForm } from "react-hook-form";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { ContentfulProviderConfigSchemaInputType } from "./config/contentful-config";
import { trpcClient } from "../trpc/trpc-client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";

const mappingFieldsNames: Array<
  keyof ContentfulProviderConfigSchemaInputType["productVariantFieldsMapping"]
> = ["name", "productId", "productName", "productSlug", "variantId", "channels"];

const ContentfulConfigForm = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: ContentfulProviderConfigSchemaInputType;
  onSubmit(values: ContentfulProviderConfigSchemaInputType): void;
}) => {
  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentfulProviderConfigSchemaInputType>({
    defaultValues: defaultValues,
  });

  const { mutate, data } = trpcClient.contentful.fetchContentTypesFromApi.useMutation({
    onSuccess(data) {
      setValue("contentId", data.items[0].sys.id ?? null);
    },
  });

  const connectionEstablished = Boolean(data);

  const selectedContentTypeId = watch("contentId");

  const availableFields = useMemo(() => {
    try {
      return data?.items?.find((i) => i.sys.id === selectedContentTypeId)?.fields;
    } catch (e) {
      return null;
    }
  }, [selectedContentTypeId, data?.items]);

  /**
   * For "edit" form variant, tokens already exist, so fetch immediately
   */
  useEffect(() => {
    mutate({
      contentfulSpace: defaultValues.spaceId,
      contentfulToken: defaultValues.authToken,
    });
  }, [defaultValues.authToken, defaultValues.spaceId]);

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
        <Text variant="heading">Provide conntection details</Text>
        <Input
          required
          control={control}
          name="spaceId"
          label="Contentful space ID"
          helperText="TODO how to get space id"
        />
        <Input
          required
          type="password"
          control={control}
          name="authToken"
          label="Contentful auth token"
          helperText="TODO how to get token"
        />
        <Box display={"flex"} justifyContent="flex-end">
          <Button
            variant="secondary"
            onClick={() => {
              const values = getValues();

              return mutate({
                contentfulSpace: values.spaceId,
                contentfulToken: values.authToken,
              });
            }}
          >
            Verify connection
          </Button>
        </Box>
      </Box>
      {connectionEstablished && (
        <Box display={"grid"} gap={4} marginY={4}>
          <Text variant="heading">Configure fields mapping</Text>
          <Text as="p">First select content type you want to synchronize products with.</Text>

          <Select
            label="Content Type"
            control={control}
            name="contentId"
            options={data?.items.map((contentType) => ({
              label: contentType.name,
              value: contentType.sys.id,
            }))}
          />

          <Box marginTop={4}>
            <Text as="p" variant="heading" size="small">
              Map fields from Saleor to your contentful schema.
            </Text>
            <Text as="p" marginTop={2} marginBottom={4}>
              All fields should be type of <Text variant="bodyStrong">Text</Text>. Channels should
              be type of <Text variant="bodyStrong">JSON</Text>.
            </Text>
            <Box
              marginBottom={4}
              display="grid"
              __gridTemplateColumns={"50% 50%"}
              borderBottomWidth={1}
              borderBottomStyle="solid"
              borderColor="neutralHighlight"
              padding={2}
            >
              <Text variant="caption">Saleor Field</Text>
              <Text variant="caption">Contentful field</Text>
            </Box>
            {availableFields &&
              mappingFieldsNames.map((saleorField) => (
                // TODO Add some better display of saleor fields + some hints
                <Box
                  display="grid"
                  __gridTemplateColumns={"50% 50%"}
                  padding={2}
                  key={saleorField}
                  alignItems="center"
                >
                  <Text>{saleorField}</Text>
                  <Select
                    size="small"
                    control={control}
                    name={`productVariantFieldsMapping.${saleorField}`}
                    label="Contentful Field"
                    options={availableFields.map((f) => ({
                      label: f.name,
                      value: f.id,
                    }))}
                  />
                </Box>
              ))}
          </Box>
          <Box display={"flex"} justifyContent="flex-end">
            <Button type="submit">Save</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const ContentfulAddConfigForm = () => {
  const { mutate } = trpcClient.contentful.addProvider.useMutation();

  return (
    <ContentfulConfigForm
      onSubmit={(values) => {
        mutate(values);
      }}
      defaultValues={{
        authToken: "",
        configName: "",
        contentId: "",
        productVariantFieldsMapping: {
          channels: "",
          name: "",
          productId: "",
          productName: "",
          productSlug: "",
          variantId: "",
        },
        spaceId: "",
      }}
    />
  );
};

export const ContentfulEditConfigForm = ({ configId }: { configId: string }) => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { data } = trpcClient.contentful.fetchProviderConfiguration.useQuery(
    {
      providerId: configId,
    },
    {
      enabled: !!configId,
    }
  );
  const { mutate } = trpcClient.contentful.updateProvider.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated configuration");
      push("/configuration");
    },
  });

  if (!data) {
    return <Text>Loading</Text>;
  }

  return (
    <ContentfulConfigForm
      defaultValues={data}
      onSubmit={(values) =>
        mutate({
          ...values,
          id: configId,
        })
      }
    />
  );
};
