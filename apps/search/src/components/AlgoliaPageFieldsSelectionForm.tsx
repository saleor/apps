import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ButtonsBox, Layout } from "@saleor/apps-ui";
import { Box, Button, Checkbox, Skeleton } from "@saleor/macaw-ui";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  type AlgoliaPageFields,
  AlgoliaPageFieldsKeys,
  AlgoliaPageFieldsLabelsMap,
} from "../lib/algolia-fields";
import { trpcClient } from "../modules/trpc/trpc-client";

interface AlgoliaPageFieldsSelectionFormInnerProps {
  defaultValues: Record<AlgoliaPageFields, boolean>;
}

const AlgoliaPageFieldsSelectionFormInner = ({
  defaultValues,
}: AlgoliaPageFieldsSelectionFormInnerProps) => {
  const { notifySuccess } = useDashboardNotification();

  const { control, handleSubmit } = useForm<Record<AlgoliaPageFields, boolean>>({
    defaultValues,
  });

  const { mutate } = trpcClient.configuration.setPageFieldsMappingConfig.useMutation({
    onSuccess() {
      notifySuccess("Success", "Algolia will be updated only with selected page fields");
    },
  });

  return (
    <Layout.AppSectionCard
      as="form"
      onSubmit={handleSubmit((values) => {
        const selectedValues = Object.entries(values)
          .filter(([, selected]) => selected)
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
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  onCheckedChange={(v) => {
                    onChange(v);
                  }}
                  checked={value}
                  name={field}
                >
                  {AlgoliaPageFieldsLabelsMap[field]}
                </Checkbox>
              )}
            />
          </Box>
        ))}
      </Box>
    </Layout.AppSectionCard>
  );
};

export const AlgoliaPageFieldsSelectionForm = () => {
  const { data: config, isLoading } = trpcClient.configuration.getConfig.useQuery();

  const defaultValues = useMemo(() => {
    if (!config) {
      return null;
    }

    const enabledFields = config.pageFieldsMapping?.enabledAlgoliaFields ?? [
      ...AlgoliaPageFieldsKeys,
    ];

    return Object.fromEntries(
      AlgoliaPageFieldsKeys.map((field) => [field, enabledFields.includes(field)]),
    ) as Record<AlgoliaPageFields, boolean>;
  }, [config]);

  if (isLoading || !defaultValues) {
    return <Skeleton height={5} />;
  }

  return <AlgoliaPageFieldsSelectionFormInner defaultValues={defaultValues} />;
};
