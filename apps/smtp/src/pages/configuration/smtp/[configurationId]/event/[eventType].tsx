import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Breadcrumbs, SkeletonLayout } from "@saleor/apps-ui";
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
      <SkeletonLayout.Section />
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

interface EditorLayoutProps {
  children: React.ReactNode;
  breadcrumbs: { name: string; href?: string }[];
}

const EditorLayout = ({ children, breadcrumbs }: EditorLayoutProps) => (
  <Box
    padding={7}
    paddingBottom={3}
    display="flex"
    flexDirection="column"
    backgroundColor="default1"
    style={{ height: "100vh", boxSizing: "border-box" }}
  >
    <Box marginBottom={6}>
      <Breadcrumbs>
        {breadcrumbs.map((breadcrumb) => (
          <Breadcrumbs.Item key={breadcrumb.name} href={breadcrumb.href}>
            {breadcrumb.name}
          </Breadcrumbs.Item>
        ))}
      </Breadcrumbs>
    </Box>
    <Box display="flex" flexDirection="column" flexGrow="1" __minHeight="0">
      {children}
    </Box>
  </Box>
);

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
          notifyError("Error during fetching the configuration");
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
    <EditorLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: `SMTP:  ${configuration.name}`, href: smtpUrls.configuration(configurationId) },
        { name: messageEventTypesLabels[eventType] },
      ]}
    >
      <EventForm configuration={configuration} eventType={eventType} />
    </EditorLayout>
  );
};

export default EditSmtpEventPage;
