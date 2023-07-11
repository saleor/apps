import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { printSaleorProductFields } from "../configuration/print-saleor-product-fields";
import { DatocmsProviderConfigInputType } from "../configuration/schemas/datocms-provider.schema";
import { trpcClient } from "../trpc/trpc-client";
import { ButtonsBox } from "../ui/buttons-box";

type FormShape = Omit<DatocmsProviderConfigInputType, "type">;

// todo extract where schema is
const mappingFieldsNames: Array<
  keyof DatocmsProviderConfigInputType["productVariantFieldsMapping"]
> = ["name", "productId", "productName", "productSlug", "variantId", "channels"];

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

const useDatoCmsRemoteFields = () => {
  const { mutate: fetchContentTypes, data: contentTypesData } =
    trpcClient.datocms.fetchContentTypes.useMutation();

  const { mutate: fetchContentTypeFields, data: fieldsData } =
    trpcClient.datocms.fetchContentTypeFields.useMutation();

  const contentTypesSelectOptions = useMemo(() => {
    if (!contentTypesData) {
      return null;
    }

    return contentTypesData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [contentTypesData]);

  return {
    fetchContentTypes,
    contentTypesData,
    contentTypesSelectOptions,
    fetchContentTypeFields,
    fieldsData,
  };
};

/*
 * todo react on token error
 * todo react on token change, refresh mutation
 */
const PureForm = ({ defaultValues, onSubmit, onDelete }: PureFormProps) => {
  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormShape>({
    defaultValues: defaultValues,
  });

  const {
    contentTypesData,
    fetchContentTypes,
    contentTypesSelectOptions,
    fetchContentTypeFields,
    fieldsData,
  } = useDatoCmsRemoteFields();

  const selectedContentType = watch("itemType");

  useEffect(() => {
    if (selectedContentType) {
      fetchContentTypeFields({
        contentTypeID: selectedContentType,
        apiToken: getValues("authToken"),
      });
    }
  }, [selectedContentType, getValues, fetchContentTypeFields]);

  useEffect(() => {
    if (defaultValues.authToken && defaultValues.itemType) {
      fetchContentTypes({
        apiToken: defaultValues.authToken,
      });

      fetchContentTypeFields({
        apiToken: defaultValues.authToken,
        contentTypeID: defaultValues.itemType,
      });
    }
  }, [defaultValues, fetchContentTypes, fetchContentTypeFields]);

  const fetchContentTypesButton = (
    <ButtonsBox>
      <Button
        variant="secondary"
        onClick={() => {
          const values = getValues();

          return fetchContentTypes({
            apiToken: values.authToken,
          });
        }}
      >
        Continue
      </Button>
    </ButtonsBox>
  );

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
          name="authToken"
          label="DatoCMS token"
          helperText="TODO exlaination how to get this token "
        />
        {!contentTypesData && fetchContentTypesButton}
      </Box>
      {contentTypesSelectOptions && (
        <Box display={"grid"} gap={4} marginY={4}>
          <Text variant="heading">Configure fields mapping</Text>
          <Select
            label="Item type"
            options={contentTypesSelectOptions}
            name="itemType"
            control={control}
          />
          <Text as="p" variant="heading" size="small">
            Map fields from Saleor to your contentful schema.
          </Text>
          <Text as="p" marginTop={2} marginBottom={4}>
            All fields should be type of <Text variant="bodyStrong">Text</Text>. Channels should be
            type of <Text variant="bodyStrong">JSON</Text>.
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
          {fieldsData &&
            mappingFieldsNames.map((saleorField) => (
              // todo extract this table to component
              <Box
                display="grid"
                __gridTemplateColumns={"50% 50%"}
                padding={2}
                key={saleorField}
                alignItems="center"
              >
                <Text>{printSaleorProductFields(saleorField)}</Text>
                <Select
                  size="small"
                  control={control}
                  name={`productVariantFieldsMapping.${saleorField}`}
                  label="DatoCMS Field"
                  options={fieldsData.map((f) => ({
                    label: f.label,
                    value: f.api_key,
                  }))}
                />
              </Box>
            ))}
        </Box>
      )}
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
  const { mutate: addProvider } = trpcClient.datocms.addProvider.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated configuration");
      push("/configuration");
    },
  });

  return (
    <PureForm
      onSubmit={(values) => {
        addProvider({
          ...values,
          type: "datocms",
        });
      }}
      onDelete={console.log}
      defaultValues={{
        authToken: "",
        configName: "",
        itemType: "",
        productVariantFieldsMapping: {
          channels: "",
          name: "",
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

  const { data } = trpcClient.datocms.fetchProviderConfiguration.useQuery(
    {
      providerId: props.configId,
    },
    {
      enabled: !!props.configId,
    }
  );
  const { mutate } = trpcClient.datocms.updateProvider.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated configuration");
      push("/configuration");
    },
  });

  const { mutate: deleteProvider } = trpcClient.datocms.deleteProvider.useMutation({
    onSuccess() {
      notifySuccess("Success", "Removed configuration");
      push("/configuration");
    },
  });

  if (!data) {
    return null;
  }

  if (data.type !== "datocms") {
    throw new Error("Trying to fill datocms form with non datocms data");
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
          type: "datocms",
          id: props.configId,
        });
      }}
      defaultValues={data}
    />
  );
};

// todo make the same with contentful
export const DatoCMSConfigForm = {
  PureVariant: PureForm,
  AddVariant: AddFormVariant,
  EditVariant: EditFormVariant,
};
