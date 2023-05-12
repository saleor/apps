import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { trpcClient } from "../../../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";
import { BasicLayout } from "../../../../../components/basic-layout";
import { parseMessageEventType } from "../../../../../modules/event-handlers/parse-message-event-type";
import { appUrls } from "../../../../../modules/app-configuration/urls";
import { EventForm } from "../../../../../modules/smtp/ui/event-form";
import { smtpUrls } from "../../../../../modules/smtp/urls";
import { TextLink } from "../../../../../components/text-link";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[{ name: "Configuration", href: appUrls.configuration() }, { name: "..." }]}
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

const EditSmtpEventPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();

  const configurationId = router.query.configurationId as string;
  const eventTypeFromQuery = router.query.eventType as string | undefined;
  const eventType = parseMessageEventType(eventTypeFromQuery);

  const { data: configuration, isLoading } = trpcClient.smtpConfiguration.getConfiguration.useQuery(
    {
      id: configurationId,
      /*
       * if event type is not valid, it calling the query will not be enabled
       * so we can safely cast it
       */
      // eventType: eventType!,
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
        { name: `SMTP:  ${configuration.name}`, href: smtpUrls.configuration(configurationId) },
        { name: eventType },
      ]}
    >
      <Box display="flex" flexDirection="column" gap={13}>
        <Text as="p">
          Edit template for {eventType} event. You can learn more about MJML{" "}
          <TextLink href="https://mjml.io/" openNewTab={true}>
            here
          </TextLink>
          .
        </Text>
        <EventForm configuration={configuration} eventType={eventType} />
      </Box>
    </BasicLayout>
  );
};

export default EditSmtpEventPage;
