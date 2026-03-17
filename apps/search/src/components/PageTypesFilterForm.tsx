import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { ButtonsBox, Layout } from "@saleor/apps-ui";
import { Box, Button, Multiselect, Skeleton, Text } from "@saleor/macaw-ui";
import { useEffect, useState } from "react";

import { trpcClient } from "../modules/trpc/trpc-client";

type PageTypeOption = { label: string; value: string };

export const PageTypesFilterForm = () => {
  const { notifySuccess } = useDashboardNotification();

  const { data: config, isLoading: isConfigLoading } =
    trpcClient.configuration.getConfig.useQuery();
  const { data: pageTypes, isLoading: isPageTypesLoading } =
    trpcClient.configuration.getPageTypes.useQuery();

  const { mutate } = trpcClient.configuration.setPageTypesFilter.useMutation({
    onSuccess() {
      notifySuccess("Success", "Only selected page types will be indexed");
    },
  });

  const [selectedValues, setSelectedValues] = useState<PageTypeOption[]>([]);

  const options: PageTypeOption[] = (pageTypes ?? []).map((pt) => ({
    label: pt.name,
    value: pt.id,
  }));

  useEffect(() => {
    if (config && pageTypes) {
      const savedIds = config.pageTypesFilter?.pageTypeIds ?? [];

      if (savedIds.length > 0) {
        setSelectedValues(
          savedIds
            .map((id) => options.find((o) => o.value === id))
            .filter((o): o is PageTypeOption => o !== undefined),
        );
      }
    }
  }, [config, pageTypes]);

  if (isConfigLoading || isPageTypesLoading) {
    return <Skeleton height={5} />;
  }

  const handleSubmit = () => {
    mutate({
      pageTypeIds: selectedValues.map((v) => v.value),
    });
  };

  return (
    <Layout.AppSectionCard
      footer={
        <ButtonsBox>
          <Button type="button" onClick={handleSubmit}>
            Save
          </Button>
        </ButtonsBox>
      }
    >
      <Box>
        <Text as="p" marginBottom={3}>
          Select which page types should be indexed. If none are selected, no pages will be indexed.
        </Text>
        <Multiselect
          label="Page types"
          options={options}
          value={selectedValues}
          onChange={(values) => setSelectedValues(values)}
        />
      </Box>
    </Layout.AppSectionCard>
  );
};
