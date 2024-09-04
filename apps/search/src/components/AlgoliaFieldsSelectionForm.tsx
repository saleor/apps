import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, Layout } from "@saleor/apps-ui";
import { Box, Button, Checkbox, Skeleton } from "@saleor/macaw-ui";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  AlgoliaRootFields,
  AlgoliaRootFieldsKeys,
  AlgoliaRootFieldsLabelsMap,
} from "../lib/algolia-fields";
import { trpcClient } from "../modules/trpc/trpc-client";

export const AlgoliaFieldsSelectionForm = () => {
  const { notifySuccess } = useDashboardNotification();

  const { setValue, control, handleSubmit } = useForm<Record<AlgoliaRootFields, boolean>>({});

  const { data: config, isLoading } = trpcClient.configuration.getConfig.useQuery();
  const { mutate } = trpcClient.configuration.setFieldsMappingConfig.useMutation({
    onSuccess() {
      notifySuccess("Success", "Algolia will be updated only with selected fields");
    },
  });

  useEffect(() => {
    if (config) {
      config.fieldsMapping.enabledAlgoliaFields.forEach((field) => {
        setValue(field as AlgoliaRootFields, true);
      });
    }
  }, [config, setValue]);

  if (isLoading || !config) {
    // todo replace with Section Skeleton
    return <Skeleton height={5} />;
  }

  return (
    <Layout.AppSectionCard
      as="form"
      onSubmit={handleSubmit((values) => {
        const selectedValues = Object.entries(values)
          .filter(([key, selected]) => selected)
          .map(([key]) => key);

        mutate({
          enabledAlgoliaFields: selectedValues,
        });
      })}
      footer={
        <ButtonsBox>
          <Button type="submit">Save</Button>
        </ButtonsBox>
      }
    >
      <Box>
        {AlgoliaRootFieldsKeys.map((field) => (
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
                    checked={value}
                    name={field}
                  >
                    {AlgoliaRootFieldsLabelsMap[field]}
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
