import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ButtonsBox, Layout } from "@saleor/apps-ui";
import { Box, Button, Checkbox, Skeleton } from "@saleor/macaw-ui";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  type AlgoliaPageFields,
  AlgoliaPageFieldsKeys,
  AlgoliaPageFieldsLabelsMap,
} from "../lib/algolia-fields";
import { trpcClient } from "../modules/trpc/trpc-client";

export const AlgoliaPageFieldsSelectionForm = () => {
  const { notifySuccess } = useDashboardNotification();

  const { setValue, control, handleSubmit } = useForm<Record<AlgoliaPageFields, boolean>>({});

  const { data: config, isLoading } = trpcClient.configuration.getConfig.useQuery();
  const { mutate } = trpcClient.configuration.setPageFieldsMappingConfig.useMutation({
    onSuccess() {
      notifySuccess("Success", "Algolia will be updated only with selected page fields");
    },
  });

  useEffect(() => {
    if (config) {
      const pageFields = config.pageFieldsMapping?.enabledAlgoliaFields ?? [
        ...AlgoliaPageFieldsKeys,
      ];

      pageFields.forEach((field) => {
        setValue(field as AlgoliaPageFields, true);
      });
    }
  }, [config, setValue]);

  if (isLoading || !config) {
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
        {AlgoliaPageFieldsKeys.map((field) => (
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
                    {AlgoliaPageFieldsLabelsMap[field]}
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
