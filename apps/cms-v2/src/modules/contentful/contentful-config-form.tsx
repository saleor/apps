import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useForm } from "react-hook-form";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { ContentfulProviderConfigSchemaInputType } from "./config/contentful-config";
import { trpcClient } from "../trpc/trpc-client";
import { useMemo } from "react";

const mappingFieldsNames: Array<
  keyof ContentfulProviderConfigSchemaInputType["productVariantFieldsMapping"]
> = ["name", "productId", "productName", "productSlug", "variantId", "channels"];

export const ContentfulConfigForm = () => {
  const { control, getValues, setValue, watch } = useForm<ContentfulProviderConfigSchemaInputType>({
    defaultValues: {
      authToken: "-YkYdPUk45ta_WBtMA_oHiWAqD06YJRwPKvAXA5B9zM", // todo,
      spaceId: "10dzov555w1j",
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
    },
  });

  const { mutate, data } = trpcClient.contentful.fetchContentTypesFromApi.useMutation({
    onSuccess(data) {
      setValue("contentId", data.items[0].sys.id ?? null);
    },
  });

  console.log(data);

  const connectionEstablished = Boolean(data);

  const selectedContentTypeId = watch("contentId");

  const availableFields = useMemo(() => {
    try {
      return data?.items?.find((i) => i.sys.id === selectedContentTypeId)?.fields;
    } catch (e) {
      return null;
    }
  }, [selectedContentTypeId, data?.items]);

  return (
    <Box as="form" display={"grid"} gap={4}>
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
              All fields should be type of <Text variant="bodyEmp">Text</Text>.{" "}
              <Text variant="bodyEmp">Channels</Text> should be type of JSON.
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
        </Box>
      )}
    </Box>
  );
};
