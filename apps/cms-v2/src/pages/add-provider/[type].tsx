import { ContentfulAddConfigForm } from "@/modules/providers/contentful/contentful-config-form";
import { DatoCMSConfigForm } from "@/modules/providers/datocms/datocms-config-form";
import { CMSType, createProvider } from "@/modules/shared/cms-provider";
import { StrapiConfigForm } from "@/modules/providers/strapi/strapi-config-form";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

// todo extract to shared config
const resolveProviderForm = (type: CMSType) => {
  switch (type) {
    case "datocms":
      return <DatoCMSConfigForm.AddVariant />;
    case "contentful":
      return <ContentfulAddConfigForm />;
    case "strapi":
      return <StrapiConfigForm.AddVariant />;
    default:
      throw new Error("Invalid CMS type, form not found");
  }
};

const AddProviderPage: NextPage = () => {
  const { query } = useRouter();

  const provider = useMemo(() => {
    return query.type ? createProvider(query.type as string) : null;
  }, [query.type]);

  if (!provider) return null;

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

      <AppSection
        heading={`Set up ${provider.displayName}`}
        sideContent={
          <Box>
            <Text>Provide required information to configure {provider.displayName}.</Text>
            {provider.formSideInfo && <Box marginTop={6}>{provider.formSideInfo}</Box>}
          </Box>
        }
        mainContent={resolveProviderForm(provider.type)}
      />
    </Box>
  );
};

export default AddProviderPage;
