import { Box, Checkbox, Skeleton, Button } from "@saleor/macaw-ui";
import { trpcClient } from "../modules/trpc/trpc-client";
import {
  TypesenseRootFields,
  TypesenseRootFieldsKeys,
  TypesenseRootFieldsLabelsMap,
} from "../lib/typesense-fields";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, Layout } from "@saleor/apps-ui";

export const TypesenseFieldsSelectionForm = () => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { setValue, control, handleSubmit } = useForm<Record<TypesenseRootFields, boolean>>({});

  const { data: config, isLoading, refetch } = trpcClient.configuration.getConfig.useQuery();
  const { mutate: setConfig } = trpcClient.configuration.setFieldsMappingConfig.useMutation({
    onSuccess: async () => {
      await Promise.all([refetch()]);
      notifySuccess("Configuration saved!");
    },
    onError: async (error) => {
      notifyError("Could not save the configuration", error.message);
    },
  });

  const requiredFields = ["productId", "variantId", "name", "productName"];

  useEffect(() => {
    if (config) {
      config.fieldsMapping.enabledTypesenseFields.forEach((field) => {
        setValue(field as TypesenseRootFields, true);
      });
    }
  }, [config, setValue]);

  if (isLoading || !config) {
    return <Skeleton height={5} />;
  }

  return (
    <Layout.AppSectionCard
      as="form"
      onSubmit={handleSubmit(async (values) => {
        const selectedValues = Object.entries(values)
          .filter(([key, selected]) => selected)
          .map(([key]) => key);

        await setConfig({ enabledTypesenseFields: selectedValues });
        await refetch();
      })}
      footer={
        <ButtonsBox>
          <Button type="submit">Save</Button>
        </ButtonsBox>
      }
    >
      <Box>
        {TypesenseRootFieldsKeys.map((field) => (
          <Box key={field} marginBottom={5}>
            <Controller
              name={field}
              control={control}
              render={({ field: { value, onChange } }) => {
                return (
                  <Checkbox
                    onCheckedChange={(v) => {
                      onChange(v);
                    }}
                    checked={requiredFields.includes(field) || value}
                    name={field}
                    disabled={requiredFields.includes(field)}
                  >
                    {TypesenseRootFieldsLabelsMap[field]}
                  </Checkbox>
                );
              }}
            />
          </Box>
        ))}
      </Box>
    </Layout.AppSectionCard>
  );
};
