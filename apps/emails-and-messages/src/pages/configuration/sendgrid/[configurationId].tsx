import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { BasicInformationSection } from "../../../modules/sendgrid/ui/basic-information-section";
import { DangerousSection } from "../../../modules/sendgrid/ui/dangrous-section";
import { ApiConnectionSection } from "../../../modules/sendgrid/ui/api-connection-section";
import { SenderSection } from "../../../modules/sendgrid/ui/sender-section";
import { EventsSection } from "../../../modules/sendgrid/ui/events-section";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../components/basic-layout";
import { ChannelsSection } from "../../../modules/sendgrid/ui/channels-section";
import { appUrls } from "../../../modules/app-configuration/urls";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "Sendgrid provider" },
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
        { name: "Sendgrid provider" },
        { name: "Not found" },
      ]}
    >
      <Text variant="hero">Could not find the requested configuration.</Text>
    </BasicLayout>
  );
};

const EditSendgridConfigurationPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();
  const configurationId = router.query.configurationId
    ? (router.query.configurationId as string)
    : undefined;
  const { data: configuration, isLoading } =
    trpcClient.sendgridConfiguration.getConfiguration.useQuery(
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
        {
          name: `Sendgrid: ${configuration.name}`,
        },
      ]}
    >
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Sendgrid with Saleor.</Text>
        </Box>
      </Box>
      <BasicInformationSection configuration={configuration} />
      <ApiConnectionSection configuration={configuration} />
      <SenderSection configuration={configuration} />
      <EventsSection configuration={configuration} />
      <ChannelsSection configuration={configuration} />
      <DangerousSection configuration={configuration} />
    </BasicLayout>
  );
};

export default EditSendgridConfigurationPage;
