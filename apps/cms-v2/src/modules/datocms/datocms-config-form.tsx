import { Box, Text } from "@saleor/macaw-ui/next";
import { DatocmsProviderConfigInputType } from "../configuration/schemas/datocms-provider.schema";
import { useForm } from "react-hook-form";
import { Input } from "@saleor/react-hook-form-macaw";

type FormShape = Omit<DatocmsProviderConfigInputType, "type">;

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

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
