import { ContentfulAddConfigForm } from "@/modules/contentful/contentful-config-form";
import { DatoCMSConfigForm } from "@/modules/datocms/datocms-config-form";
import { CMSType, createProvider } from "@/modules/shared/cms-provider";
import { StrapiConfigForm } from "@/modules/strapi/strapi-config-form";
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
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/add-provider">Add Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>{provider.displayName}</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading={`Set up ${provider.displayName}`}
        sideContent={
          <Box>
            <Text>Provide required information to configure DatoCMS.</Text>
          </Box>
        }
        mainContent={resolveProviderForm(provider.type)}
      />
    </Box>
  );
};

export default AddProviderPage;
