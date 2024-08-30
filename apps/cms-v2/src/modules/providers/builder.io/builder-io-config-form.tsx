import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, SkeletonLayout, TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { BuilderIoProviderConfig, SaleorProviderFieldsMappingKeys } from "../../configuration";
import { printSaleorProductFields } from "../../configuration/print-saleor-product-fields";
import { trpcClient } from "../../trpc/trpc-client";

type FormShape = Omit<BuilderIoProviderConfig.InputShape, "type">;
const FormSchema = BuilderIoProviderConfig.Schema.Input.omit({ type: true });

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

const PureForm = ({ defaultValues, onSubmit, onDelete }: PureFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(FormSchema),
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
          type="password"
          required
          control={control}
          name="privateApiKey"
          label="Private API key (write API)"
          helperText={
            <Text size={3}>
              You can find it in and generate in{" "}
              <TextLink size={1} newTab href="https://builder.io/account/space">
                account settings
              </TextLink>
            </Text>
          }
        />
        <Input
          type="password"
          required
          control={control}
          name="publicApiKey"
          label="Public API key (read API)"
          helperText={
            <Text size={3}>
              You can find it in{" "}
              <TextLink size={1} newTab href="https://builder.io/account/space">
                account settings
              </TextLink>
            </Text>
          }
        />
      </Box>
      <Box display={"grid"} gap={4} marginY={4}>
        <Text size={5} fontWeight="bold">
          Configure fields mapping
        </Text>
        <Input
          required
          control={control}
          name="modelName"
          label="CMS Data model name"
          helperText="Structured content model name. E.g. 'products' or 'product-variants'"
          placeholder="saleor-variant"
        />

        <Text as="p" size={4} fontWeight="bold">
          Map fields from Saleor to your contentful schema.
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
          <Text size={2}>Builder.io field</Text>
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
              label="Builder.io Field"
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
  );
};

const AddFormVariant = () => {
  const { push } = useRouter();
  const { notifySuccess } = useDashboardNotification();
  const { mutate: addProvider } = trpcClient.providersConfigs.addOne.useMutation({
    onSuccess() {
      notifySuccess("Success", "Saved configuration");
      push("/configuration");
    },
  });

  return (
    <PureForm
      onSubmit={(values) => {
        addProvider({
          ...values,
          type: "builder.io",
        });
      }}
      defaultValues={{
        configName: "",
        publicApiKey: "",
        privateApiKey: "",
        modelName: "",
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
    return <SkeletonLayout.Section />;
  }

  if (data.type !== "builder.io") {
    throw new Error("Trying to fill builder.io form with non builder.io data");
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
          type: "builder.io",
          id: props.configId,
        });
      }}
      defaultValues={data}
    />
  );
};

export const BuilderIoConfigForm = {
  PureVariant: PureForm,
  AddVariant: AddFormVariant,
  EditVariant: EditFormVariant,
};
