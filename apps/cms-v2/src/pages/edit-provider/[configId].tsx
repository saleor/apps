import { ContentfulEditConfigForm } from "@/modules/contentful/contentful-config-form";
import { DatoCMSConfigForm } from "@/modules/datocms/datocms-config-form";
import { createProvider } from "@/modules/shared/cms-provider";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

// todo dynamically set form and provider
const AddContentfulPage: NextPage = () => {
  const { push, query } = useRouter();
  const configId = query["configId"] as string;

  const { data, isLoading, isFetched } = trpcClient.providersList.fetchConfiguration.useQuery(
    {
      id: configId,
    },
    {
      enabled: !!configId,
    }
  );

  const provider = useMemo(() => {
    return data ? createProvider(data.type) : null;
  }, [data]);

  if (isLoading) {
    return null; // todo loading
  }

  if (isFetched && !data) {
    push("/configuration"); // todo 404 notification or page?
  }

  const renderEditForm = () => {
    switch (data?.type) {
      case "contentful": {
        return <ContentfulEditConfigForm configId={configId} />;
      }
      case "datocms": {
        return <DatoCMSConfigForm.EditVariant configId={configId} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item>Edit Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>{provider?.displayName}</Breadcrumbs.Item>
          <Breadcrumbs.Item>{data?.configName}</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection heading="Edit CMS configuration" mainContent={renderEditForm()} />
    </Box>
  );
};

export default AddContentfulPage;
