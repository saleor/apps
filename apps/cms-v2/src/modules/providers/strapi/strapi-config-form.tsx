import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { SaleorProviderFieldsMappingKeys, StrapiProviderConfig } from "../../configuration";
import { printSaleorProductFields } from "../../configuration/print-saleor-product-fields";
import { trpcClient } from "../../trpc/trpc-client";
import { ButtonsBox, SkeletonLayout } from "@saleor/apps-ui";

type FormShape = Omit<StrapiProviderConfig.InputShape, "type">;

type PureFormProps = {
  defaultValues: FormShape;
  onSubmit(values: FormShape): void;
  onDelete?(): void;
};

const PureForm = ({ defaultValues, onSubmit, onDelete }: PureFormProps) => {
  const { control, handleSubmit } = useForm({
    defaultValues: defaultValues,
    resolver: zodResolver(StrapiProviderConfig.Schema.Input.omit({ type: true })),
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
        <Text variant="heading">Provide connection details</Text>
        <Input
          required
          control={control}
          name="authToken"
          label="Auth token"
          helperText="Token with full permissions for the content type you want Saleor to store product."
        />
        <Input
          required
          control={control}
          name="url"
          label="API Url"
          helperText="Base api URL, usually without /api suffix"
          placeholder="https://your-strapi-url.com"
        />
      </Box>
      <Box display={"grid"} gap={4} marginY={4}>
        <Text variant="heading">Configure fields mapping</Text>
        <Input
          label="Item type"
          name="itemType"
          control={control}
          placeholder="saleor-products"
          helperText="Plural name of the content type you want Saleor to send product to. E.g. 'products' or 'product-variants'"
        />

        <Text as="p" variant="heading" size="small">
          Map fields from Saleor to your Strapi schema.
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
          <Text variant="caption">Strapi field</Text>
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
              <Text as="p" variant="bodyStrong">
                {printSaleorProductFields(saleorField)}
              </Text>
              <Text variant="caption">
                {saleorField === "channels" ? "JSON field" : "Text field"}
              </Text>
            </Box>
            <Input
              size="small"
              control={control}
              name={`productVariantFieldsMapping.${saleorField}`}
              label="Strapi Field"
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
          type: "strapi",
        });
      }}
      defaultValues={{
        configName: "",
        authToken: "",
        url: "",
        itemType: "",
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

  if (data.type !== "strapi") {
    throw new Error("Trying to fill strapi form with non strapi data");
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
          type: "strapi",
          id: props.configId,
        });
      }}
      defaultValues={data}
    />
  );
};

/*
 * todo make the same with contentful
 * todo improve copy
 */
export const StrapiConfigForm = {
  PureVariant: PureForm,
  AddVariant: AddFormVariant,
  EditVariant: EditFormVariant,
};
