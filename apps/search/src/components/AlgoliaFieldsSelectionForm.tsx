import { Box, Checkbox, Divider, Skeleton, Button } from "@saleor/macaw-ui/next";
import { trpcClient } from "../modules/trpc/trpc-client";
import {
  AlgoliaRootFields,
  AlgoliaRootFieldsKeys,
  AlgoliaRootFieldsLabelsMap,
} from "../lib/algolia-fields";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDashboardNotification } from "@saleor/apps-shared";

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
    <Box>
      <form
        onSubmit={handleSubmit((values) => {
          const selectedValues = Object.entries(values)
            .filter(([key, selected]) => selected)
            .map(([key]) => key);

          mutate({
            enabledAlgoliaFields: selectedValues,
          });
        })}
      >
        <Box padding={5}>
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
        <Divider margin={0} marginTop={5} />
        <Box padding={5} display="flex" justifyContent="flex-end">
          <Button type="submit">Save</Button>
        </Box>
      </form>
    </Box>
  );
};
