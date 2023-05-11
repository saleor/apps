import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../../../components/basic-layout";
import { parseMessageEventType } from "../../../../../modules/event-handlers/parse-message-event-type";
import { appUrls } from "../../../../../modules/app-configuration/urls";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "SMTP provider" },
        { name: "Event configuration" },
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
        { name: "Event configuration" },
        { name: "Not found" },
      ]}
    >
      <Text variant="hero">Could not find the requested configuration.</Text>
    </BasicLayout>
  );
};

const EditSmtpEventPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();

  const configurationId = router.query.configurationId as string;
  const eventTypeFromQuery = router.query.eventType as string | undefined;
  const eventType = parseMessageEventType(eventTypeFromQuery);

  const { data: configuration, isLoading } =
    trpcClient.smtpConfiguration.getEventConfiguration.useQuery(
      {
        id: configurationId,
        /*
         * if event type is not valid, it calling the query will not be enabled
         * so we can safely cast it
         */
        eventType: eventType!,
      },
      {
        enabled: !!configurationId && !!eventType,
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

  // TODO: better error messages
  if (!eventType || !configurationId) {
    return <>Error: no event type or configuration id</>;
  }

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
        { name: "SMTP provider" },
        { name: "Event configuration" },
        { name: configuration.eventType },
      ]}
    >
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Smtp with Saleor.</Text>
        </Box>
      </Box>
    </BasicLayout>
  );
};

export default EditSmtpEventPage;
