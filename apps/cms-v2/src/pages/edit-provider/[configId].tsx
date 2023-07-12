import { ContentfulEditConfigForm } from "@/modules/contentful/contentful-config-form";
import { DatoCMSConfigForm } from "@/modules/datocms/datocms-config-form";
import { createProvider } from "@/modules/shared/cms-provider";
import { StrapiConfigForm } from "@/modules/strapi/strapi-config-form";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

const EditProviderPage: NextPage = () => {
  const { push, query } = useRouter();
  const configId = query["configId"] as string;

  const { data, isLoading, isFetched } = trpcClient.providersConfigs.getOne.useQuery(
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
    return <Text>Loading...</Text>;
  }

  if (isFetched && !data) {
    push("/404");

    return null;
  }

  const renderEditForm = () => {
    switch (data?.type) {
      case "contentful": {
        return <ContentfulEditConfigForm configId={configId} />;
      }
      case "datocms": {
        return <DatoCMSConfigForm.EditVariant configId={configId} />;
      }
      case "strapi": {
        return <StrapiConfigForm.EditVariant configId={configId} />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Box>
      <AppHeader
        text={`Edit connected provider`}
        breadcrumbs={[
          <Breadcrumbs.Item>Edit Provider</Breadcrumbs.Item>,
          <Breadcrumbs.Item>{provider?.displayName}</Breadcrumbs.Item>,
          <Breadcrumbs.Item>{data?.configName}</Breadcrumbs.Item>,
        ]}
      />
      <AppSection heading="Edit CMS configuration" mainContent={renderEditForm()} />
    </Box>
  );
};

export default EditProviderPage;
