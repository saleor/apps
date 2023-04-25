import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { SectionWithDescription } from "../../components/section-with-description";
import { ProviderSelectionBox } from "../../modules/app-configuration/ui/provider-selection-box";
import { useRouter } from "next/router";

const ChooseProviderPage: NextPage = () => {
  const { replace } = useRouter();

  return (
    <Box padding={10} display={"grid"} gap={13}>
      <Breadcrumbs items={[{ name: "Configuration", href: "/" }, { name: "Add provider" }]} />
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Select and configure providers to connect Saleor with selected services.</Text>
        </Box>
      </Box>
      <SectionWithDescription title="Choose provider">
        <Box display="grid" gridTemplateColumns={2} gap={6}>
          <ProviderSelectionBox
            providerName="Sendgrid"
            providerDescription="Use dynamic templates created in Sendgrid dashboard to send messages. Event data will be forwarded to Sendgrid."
            onClick={() => replace("/configuration/sendgrid/new")}
          />

          <ProviderSelectionBox
            providerName="SMTP & MJML"
            providerDescription="Provide your own SMTP credentials and map Saleor event to custom MJML templates."
            onClick={() => replace("/configuration/mjml/new")}
          />
        </Box>
      </SectionWithDescription>
    </Box>
  );
};

export default ChooseProviderPage;
