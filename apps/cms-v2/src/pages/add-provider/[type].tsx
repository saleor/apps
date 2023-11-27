import { CMSType } from "@/modules/providers/providers-registry";
import { ProvidersResolver } from "@/modules/providers/providers-resolver";

import { AppHeader } from "@/modules/ui/app-header";
import { Breadcrumbs, Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

const AddProviderPage: NextPage = () => {
  const { query } = useRouter();

  const provider = useMemo(() => {
    return query.type ? ProvidersResolver.createProviderMeta(query.type as CMSType) : null;
  }, [query.type]);

  if (!provider) return null;

  const FormComponent = ProvidersResolver.getAddNewProviderFormComponent(provider.type);

  return (
    <Box>
      <AppHeader
        text={`Connect ${provider.displayName} CMS to the App.`}
        breadcrumbs={[
          <Breadcrumbs.Item key="add" href="/add-provider">
            Add Provider
          </Breadcrumbs.Item>,
          <Breadcrumbs.Item key="displayname">{provider.displayName}</Breadcrumbs.Item>,
        ]}
      />

      <Layout.AppSection
        heading={`Set up ${provider.displayName}`}
        sideContent={
          <Box>
            <Text>Provide required information to configure {provider.displayName}.</Text>
            {provider.formSideInfo && <Box marginTop={6}>{provider.formSideInfo}</Box>}
          </Box>
        }
      >
        <Layout.AppSectionCard>
          <FormComponent />
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};

export default AddProviderPage;
