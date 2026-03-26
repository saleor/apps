import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ButtonsBox, Layout } from "@saleor/apps-ui";
import { Box, Button, Multiselect, Skeleton, Text } from "@saleor/macaw-ui";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { trpcClient } from "../modules/trpc/trpc-client";

type PageTypeOption = { label: string; value: string };

interface PageTypesFilterFormValues {
  selectedPageTypes: PageTypeOption[];
}

interface PageTypesFilterFormInnerProps {
  options: PageTypeOption[];
  defaultValues: PageTypesFilterFormValues;
  onSaved?: () => void;
}

const PageTypesFilterFormInner = ({
  options,
  defaultValues,
  onSaved,
}: PageTypesFilterFormInnerProps) => {
  const { notifySuccess } = useDashboardNotification();

  const { control, handleSubmit } = useForm<PageTypesFilterFormValues>({
    defaultValues,
  });

  const { mutate } = trpcClient.configuration.setPageTypesFilter.useMutation({
    onSuccess() {
      onSaved?.();
      notifySuccess("Success", "Only selected page types will be indexed");
    },
  });

  return (
    <Layout.AppSectionCard
      as="form"
      onSubmit={handleSubmit((values) => {
        mutate({
          pageTypeIds: values.selectedPageTypes.map((v) => v.value),
        });
      })}
      footer={
        <ButtonsBox>
          <Button type="submit">Save</Button>
        </ButtonsBox>
      }
    >
      <Box>
        <Text as="p" marginBottom={3}>
          Select which page types should be indexed. If none are selected, no pages will be indexed.
        </Text>
        <Controller
          name="selectedPageTypes"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Multiselect label="Page types" options={options} value={value} onChange={onChange} />
          )}
        />
      </Box>
    </Layout.AppSectionCard>
  );
};

interface PageTypesFilterFormProps {
  onSaved?: () => void;
}

export const PageTypesFilterForm = ({ onSaved }: PageTypesFilterFormProps) => {
  const { data: config, isLoading: isConfigLoading } =
    trpcClient.configuration.getConfig.useQuery();
  const { data: pageTypes, isLoading: isPageTypesLoading } =
    trpcClient.configuration.getPageTypes.useQuery();

  const options: PageTypeOption[] = useMemo(
    () => (pageTypes ?? []).map((pt) => ({ label: pt.name, value: pt.id })),
    [pageTypes],
  );

  const initialSelection = useMemo(() => {
    const savedIds = config?.pageTypesFilter?.pageTypeIds ?? [];

    return savedIds
      .map((id) => options.find((o) => o.value === id))
      .filter((o): o is PageTypeOption => o !== undefined);
  }, [config, options]);

  if (isConfigLoading || isPageTypesLoading || !config || !pageTypes) {
    return <Skeleton height={5} />;
  }

  return (
    <PageTypesFilterFormInner
      options={options}
      defaultValues={{ selectedPageTypes: initialSelection }}
      onSaved={onSaved}
    />
  );
};
