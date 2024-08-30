import { useDashboardNotification } from "@saleor/apps-shared";
import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { BasicLayout } from "../../../../../components/basic-layout";
import { appUrls } from "../../../../../modules/app-configuration/urls";
import { messageEventTypesLabels } from "../../../../../modules/event-handlers/message-event-types";
import { parseMessageEventType } from "../../../../../modules/event-handlers/parse-message-event-type";
import { EventForm } from "../../../../../modules/smtp/ui/event-form";
import { smtpUrls } from "../../../../../modules/smtp/urls";
import { trpcClient } from "../../../../../modules/trpc/trpc-client";

const LoadingView = () => {
  return (
    <BasicLayout
      breadcrumbs={[{ name: "Configuration", href: appUrls.configuration() }, { name: "..." }]}
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

const EditSmtpEventPage: NextPage = () => {
  const { notifyError } = useDashboardNotification();
  const router = useRouter();

  const configurationId = router.query.configurationId as string;
  const eventTypeFromQuery = router.query.eventType as string | undefined;
  const eventType = parseMessageEventType(eventTypeFromQuery);

  const { data: configuration, isLoading } = trpcClient.smtpConfiguration.getConfiguration.useQuery(
    {
      id: configurationId,
    },
    {
      enabled: !!configurationId && !!eventType,
      onSettled(data, error) {
        if (error) {
          console.error("Error during fetching the configuration: ", error);
        }
        if (error?.data?.code === "NOT_FOUND" || !data) {
          notifyError("The requested configuration does not exist.");
          router.replace(appUrls.configuration());
        }
      },
    },
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
        { name: messageEventTypesLabels[eventType] },
      ]}
    >
      <Box display="flex" flexDirection="column" gap={10}>
        <Text as="p">
          Edit template for <code>{eventType}</code> event. You can learn more about{" "}
          <TextLink href="https://mjml.io/" newTab={true}>
            MJML
          </TextLink>{" "}
          and{" "}
          <TextLink href="https://handlebarsjs.com/" newTab={true}>
            Handlebars
          </TextLink>
          . Additional syntax via{" "}
          <TextLink href="https://github.com/helpers/handlebars-helpers/tree/master" newTab>
            Handlebars Helpers
          </TextLink>{" "}
          is supported
        </Text>
        <EventForm configuration={configuration} eventType={eventType} />
      </Box>
    </BasicLayout>
  );
};

export default EditSmtpEventPage;
