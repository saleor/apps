import { ProvidersResolver } from "@/modules/providers/providers-resolver";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppHeader } from "@/modules/ui/app-header";
import { Breadcrumbs, Layout, SkeletonLayout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
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
    },
  );

  const provider = useMemo(() => {
    return data ? ProvidersResolver.createProviderMeta(data.type) : null;
  }, [data]);

  if (isLoading) {
    return <SkeletonLayout.Section />;
  }

  if (isFetched && !data) {
    push("/404");

    return null;
  }

  if (!provider) {
    return <SkeletonLayout.Section />;
  }

  const EditForm = ProvidersResolver.getEditProviderFormComponent(provider.type);

  return (
    <Box>
      <AppHeader
        text={`Edit connected provider`}
        breadcrumbs={[
          <Breadcrumbs.Item key="editProvider">Edit Provider</Breadcrumbs.Item>,
          <Breadcrumbs.Item key="displayName">{provider?.displayName}</Breadcrumbs.Item>,
          <Breadcrumbs.Item key="configName">{data?.configName}</Breadcrumbs.Item>,
        ]}
      />
      <Layout.AppSection
        heading="Edit CMS configuration"
        sideContent={
          <Box>{provider.formSideInfo && <Box marginTop={6}>{provider.formSideInfo}</Box>}</Box>
        }
      >
        <Layout.AppSectionCard>
          <EditForm configId={configId} />
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};

export default EditProviderPage;
