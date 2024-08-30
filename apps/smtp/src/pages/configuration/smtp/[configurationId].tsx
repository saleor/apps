import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { BasicLayout } from "../../../components/basic-layout";
import { appUrls } from "../../../modules/app-configuration/urls";
import { SmtpBasicInformationSection } from "../../../modules/smtp/ui/smtp-basic-information-section";
import { SmtpChannelsSection } from "../../../modules/smtp/ui/smtp-channels-section";
import { SmtpDangerousSection } from "../../../modules/smtp/ui/smtp-dangerous-section";
import { SmtpEventsSection } from "../../../modules/smtp/ui/smtp-events-section";
import { SmtpSection } from "../../../modules/smtp/ui/smtp-section";
import { SmtpSenderSection } from "../../../modules/smtp/ui/smtp-sender-section";
import { trpcClient } from "../../../modules/trpc/trpc-client";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "SMTP provider" },
        { name: "..." },
      ]}
    >
      <Text size={10} fontWeight="bold">
        Loading...
      </Text>
    </BasicLayout>
  );
};

const NotFoundView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "SMTP provider" },
        { name: "Not found" },
      ]}
    >
      <Text size={10} fontWeight="bold">
        Could not find the requested configuration.
      </Text>
    </BasicLayout>
  );
};

const EditSmtpConfigurationPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();
  const configurationId = router.query.configurationId
    ? (router.query.configurationId as string)
    : undefined;
  const { data: configuration, isLoading } = trpcClient.smtpConfiguration.getConfiguration.useQuery(
    {
      id: configurationId!,
    },
    {
      enabled: !!configurationId,
      onSettled(data, error) {
        if (error) {
          console.error("Could not fetch configuration data:", error);
        }
        if (error?.data?.code === "NOT_FOUND" || !data) {
          notifyError("The requested configuration does not exist.");
          router.replace(appUrls.configuration());
        }
      },
    },
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (!configuration) {
    return <NotFoundView />;
  }

  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: `SMTP: ${configuration.name}` },
      ]}
    >
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect SMTP with Saleor.</Text>
        </Box>
      </Box>
      <SmtpBasicInformationSection configuration={configuration} />
      <SmtpSection configuration={configuration} />
      <SmtpSenderSection configuration={configuration} />
      <SmtpEventsSection configuration={configuration} />
      <SmtpChannelsSection configuration={configuration} />
      <SmtpDangerousSection configuration={configuration} />
    </BasicLayout>
  );
};

export default EditSmtpConfigurationPage;
