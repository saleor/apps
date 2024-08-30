import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { SaleorProviderFieldsMappingKeys } from "@/modules/configuration";

import { printSaleorProductFields } from "../../configuration/print-saleor-product-fields";
import { ContentfulProviderConfig } from "../../configuration/schemas/contentful-provider.schema";
import { trpcClient } from "../../trpc/trpc-client";

type FormSchema = Omit<ContentfulProviderConfig.InputShape, "type">;

/**
 * TODO - when space, token or env changes, refetch queries
 * TODO - refactor smaller hooks
 */
const PureForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  type,
}: {
  defaultValues: FormSchema;
  onSubmit(values: FormSchema): void;
  onDelete?(): void;
  type: "create" | "edit";
}) => {
  const { notifyError } = useDashboardNotification();

  const { control, getValues, setValue, watch, handleSubmit, setError, clearErrors } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(ContentfulProviderConfig.Schema.Input.omit({ type: true })),
  });

  const { mutate: fetchContentTypes, data: contentTypesData } =
    trpcClient.contentful.fetchContentTypesFromApi.useMutation({
      onSuccess(data) {
        setValue("contentId", data.items[0].sys.id ?? null);

        clearErrors(["authToken", "spaceId"]);
      },
      onError() {
        setError("authToken", {
          type: "custom",
          message: "Invalid credentials",
        });
        setError("spaceId", {
          type: "custom",
          message: "Invalid credentials",
        });
        notifyError(
          "Error",
          "Could not fetch content types from Contentful. Please check your credentials.",
        );
      },
    });

  const { mutate: fetchEnvironments, data: environmentsData } =
    trpcClient.contentful.fetchEnvironmentsFromApi.useMutation({
      onSuccess(data) {
        // Set initial value when creating config
        if (type === "create") {
          setValue("environment", data.items[0].sys.id);
        }

        clearErrors(["authToken", "spaceId"]);
      },
      onError() {
        setError("authToken", {
          type: "custom",
          message: "Invalid credentials",
        });
        setError("spaceId", {
          type: "custom",
          message: "Invalid credentials",
        });
        notifyError(
          "Error",
          "Could not fetch environments from Contentful. Please check your credentials.",
        );
      },
    });

  const selectedContentTypeId = watch("contentId");

  const availableFields = useMemo(() => {
    try {
      return contentTypesData?.items?.find((i) => i.sys.id === selectedContentTypeId)?.fields;
    } catch (e) {
      return null;
    }
  }, [selectedContentTypeId, contentTypesData?.items]);

  /**
   * For "edit" form variant, tokens already exist, so fetch immediately
   */
  useEffect(() => {
    if (defaultValues.authToken && defaultValues.spaceId && defaultValues.environment) {
      fetchContentTypes({
        contentfulSpace: defaultValues.spaceId,
        contentfulToken: defaultValues.authToken,
        contentfulEnv: defaultValues.environment,
      });

      fetchEnvironments({
        contentfulSpace: defaultValues.spaceId,
        contentfulToken: defaultValues.authToken,
      });
    }
  }, [
    defaultValues.authToken,
    defaultValues.spaceId,
    defaultValues.environment,
    fetchContentTypes,
    fetchEnvironments,
  ]);

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
          name="spaceId"
          label="Contentful space ID"
          helperText={
            <Text size={3} color="default2">
              Check{" "}
              <TextLink size={1} href="https://www.contentful.com/help/find-space-id/" newTab>
                how to get space ID
              </TextLink>
            </Text>
          }
        />
        <Input
          required
          type="password"
          control={control}
          name="authToken"
          label="Content Management Personal token"
          helperText={
            <Text size={3} color="default2">
              Check{" "}
              <TextLink
                size={1}
                href="https://www.contentful.com/help/personal-access-tokens/"
                newTab
              >
                how to generate token
              </TextLink>
            </Text>
          }
        />
        {!environmentsData && (
          <ButtonsBox>
            <Button
              variant="secondary"
              onClick={() => {
                const values = getValues();

                return fetchEnvironments({
                  contentfulSpace: values.spaceId,
                  contentfulToken: values.authToken,
                });
              }}
            >
              Continue
            </Button>
          </ButtonsBox>
        )}
        {environmentsData && (
          <>
            <Select
              required
              control={control}
              name="environment"
              label="Contentful environment"
              helperText={
                <Text size={3} color="default2">
                  Check your environment{" "}
                  <TextLink
                    newTab
                    size={1}
                    href={`https://app.contentful.com/spaces/${getValues(
                      "spaceId",
                    )}/settings/environments`}
                  >
                    here
                  </TextLink>
                </Text>
              }
              options={environmentsData.items.map((item) => ({
                // Show alias label when given environment is alis
                label: item.sys.aliasedEnvironment
                  ? `Alias: ${item.sys.id} (${item.name})`
                  : item.name,
                value: item.sys.id,
              }))}
            />
            {!contentTypesData && (
              <ButtonsBox>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const values = getValues();

                    return fetchContentTypes({
                      contentfulSpace: values.spaceId,
                      contentfulToken: values.authToken,
                      contentfulEnv: values.environment,
                    });
                  }}
                >
                  Continue
                </Button>
              </ButtonsBox>
            )}
          </>
        )}
      </Box>
      {contentTypesData && (
        <Box display={"grid"} gap={4} marginY={4}>
          <Text size={5} fontWeight="bold">
            Configure fields mapping
          </Text>
          <Text as="p">First select content type you want to synchronize products with.</Text>

          <Select
            label="Content Type"
            control={control}
            name="contentId"
            options={contentTypesData?.items.map((contentType) => ({
              label: contentType.name,
              value: contentType.sys.id,
            }))}
          />

          <Box marginTop={4}>
            <Text as="p" size={4} fontWeight="bold">
              Map fields from Saleor to your Contentful schema.
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
              <Text size={2}>Contentful field</Text>
            </Box>
            {availableFields &&
              SaleorProviderFieldsMappingKeys.map((saleorField) => (
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
          <ButtonsBox>
            {onDelete && (
              <Button onClick={onDelete} variant="tertiary">
                Delete
              </Button>
            )}
            <Button type="submit">Save</Button>
          </ButtonsBox>
        </Box>
      )}
    </Box>
  );
};

const AddVariant = () => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.providersConfigs.addOne.useMutation({
    onSuccess() {
      notifySuccess("Success", "Saved configuration");
      push("/configuration");
    },
  });

  return (
    <ContentfulConfigForm.PureVariant
      type="create"
      onSubmit={(values) => {
        mutate({
          ...values,
          type: "contentful",
        });
      }}
      defaultValues={{
        authToken: "",
        configName: "",
        environment: "",
        contentId: "",
        productVariantFieldsMapping: {
          channels: "",
          variantName: "",
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

const EditVariant = ({ configId }: { configId: string }) => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();

  const { data } = trpcClient.providersConfigs.getOne.useQuery(
    {
      id: configId,
    },
    {
      enabled: !!configId,
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
    return <Text>Loading</Text>;
  }

  if (data.type !== "contentful") {
    throw new Error("Trying to fill contentful form with non contentful data");
  }

  return (
    <ContentfulConfigForm.PureVariant
      type="edit"
      onDelete={() => {
        deleteProvider({ id: configId });
      }}
      defaultValues={data}
      onSubmit={(values) =>
        mutate({
          ...values,
          id: configId,
          type: "contentful",
        })
      }
    />
  );
};

export const ContentfulConfigForm = {
  PureVariant: PureForm,
  AddVariant,
  EditVariant,
};
