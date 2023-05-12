import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../components/basic-layout";
import { BasicInformationSection } from "../../../modules/smtp/ui/basic-information-section";
import { SmtpSection } from "../../../modules/smtp/ui/smtp-section";
import { SenderSection } from "../../../modules/smtp/ui/sender-section";
import { DangerousSection } from "../../../modules/smtp/ui/dangrous-section";
import { ChannelsSection } from "../../../modules/smtp/ui/channels-section";
import { EventsSection } from "../../../modules/smtp/ui/events-section";
import { appUrls } from "../../../modules/app-configuration/urls";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "SMTP provider" },
        { name: "..." },
      ]}
    >
      <Text variant="hero">Loading...</Text>
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
      <Text variant="hero">Could not find the requested configuration.</Text>
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
          console.log("Error: ", error);
        }
        if (error?.data?.code === "NOT_FOUND" || !data) {
          notifyError("The requested configuration does not exist.");
          router.replace("/configuration");
        }
      },
    }
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
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect SMTP with Saleor.</Text>
        </Box>
      </Box>
      <BasicInformationSection configuration={configuration} />
      <SmtpSection configuration={configuration} />
      <SenderSection configuration={configuration} />
      <EventsSection configuration={configuration} />
      <ChannelsSection configuration={configuration} />
      <DangerousSection configuration={configuration} />
    </BasicLayout>
  );
};

export default EditSmtpConfigurationPage;
