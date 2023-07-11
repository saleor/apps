import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { DatocmsProviderConfigInputType } from "../configuration/schemas/datocms-provider.schema";
import { useForm } from "react-hook-form";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { trpcClient } from "../trpc/trpc-client";
import { useMemo } from "react";

type FormShape = Omit<DatocmsProviderConfigInputType, "type">;

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

const useDatoCmsRemoteFields = () => {
  const { mutate: fetchContentTypes, data: contentTypesData } =
    trpcClient.datocms.fetchContentTypes.useMutation();

  const contentTypesSelectOptions = useMemo(() => {
    if (!contentTypesData) {
      return null;
    }

    return contentTypesData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [contentTypesData]);

  console.log(contentTypesData);

  return {
    fetchContentTypes,
    contentTypesData,
    contentTypesSelectOptions,
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

  const { contentTypesData, fetchContentTypes, contentTypesSelectOptions } =
    useDatoCmsRemoteFields();

  const fetchContentTypesButton = (
    <Box display={"flex"} justifyContent="flex-end">
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
    </Box>
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
        {contentTypesSelectOptions && (
          <Select
            label="Item type"
            options={contentTypesSelectOptions}
            name="itemType"
            control={control}
          />
        )}
      </Box>
    </Box>
  );
};

const AddFormVariant = () => {
  return (
    <PureForm
      onSubmit={console.log}
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

const EditFormVariant = () => {};

// todo make the same with contentful
export const DatoCMSConfigForm = {
  PureVariant: PureForm,
  AddVariant: AddFormVariant,
  EditVariant: EditFormVariant,
};
