import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { SendgridBasicInformationSection } from "../../../modules/sendgrid/ui/sendgrid-basic-information-section";
import { SendgridDangerousSection } from "../../../modules/sendgrid/ui/sendgrid-dangrous-section";
import { ApiConnectionSection } from "../../../modules/sendgrid/ui/api-connection-section";
import { SendgridSenderSection } from "../../../modules/sendgrid/ui/sendgrid-sender-section";
import { SendgridEventsSection } from "../../../modules/sendgrid/ui/sendgrid-events-section";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../components/basic-layout";
import { SendgridChannelsSection } from "../../../modules/sendgrid/ui/sendgrid-channels-section";
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
      <SendgridBasicInformationSection configuration={configuration} />
      <ApiConnectionSection configuration={configuration} />
      <SendgridSenderSection configuration={configuration} />
      <SendgridEventsSection configuration={configuration} />
      <SendgridChannelsSection configuration={configuration} />
      <SendgridDangerousSection configuration={configuration} />
    </BasicLayout>
  );
};

export default EditSendgridConfigurationPage;
