import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { SectionWithDescription } from "../../components/section-with-description";
import { ProviderSelectionBox } from "../../modules/app-configuration/ui/provider-selection-box";
import { useRouter } from "next/router";
import { sendgridUrls } from "../../modules/sendgrid/urls";
import { smtpUrls } from "../../modules/smtp/urls";
import { appUrls } from "../../modules/app-configuration/urls";
import { BasicLayout } from "../../components/basic-layout";
import { SendgridLogo } from "../../modules/sendgrid/ui/sendgrid-logo";
import { SmtpLogo } from "../../modules/smtp/ui/smtp-logo";

const ChooseProviderPage: NextPage = () => {
  const { push } = useRouter();

  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "Add provider" },
      ]}
    >
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Select and configure providers to connect Saleor with selected services.</Text>
        </Box>
      </Box>
      <SectionWithDescription title="Choose provider">
        <Box display="grid" gridTemplateColumns={2} gap={3}>
          <ProviderSelectionBox
            providerName="SendGrid"
            providerLogo={<SendgridLogo height={20} width={20} />}
            providerDescription="Use dynamic templates created in SendGrid dashboard to send messages. Event data will be forwarded to SendGrid."
            onClick={() => push(sendgridUrls.newConfiguration())}
          />

          <ProviderSelectionBox
            providerName="SMTP"
            providerLogo={<SmtpLogo height={20} width={20} />}
            providerDescription="Provide your own SMTP credentials and map Saleor event to custom MJML templates."
            onClick={() => push(smtpUrls.newConfiguration())}
          />
        </Box>
      </SectionWithDescription>
    </BasicLayout>
  );
};

export default ChooseProviderPage;
