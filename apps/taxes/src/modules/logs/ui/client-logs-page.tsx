import { Provider } from "jotai";
import { Section } from "../../ui/app-section";
import { Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { ClientLogs } from "./client-logs";
import { AppPageLayout } from "../../ui/app-page-layout";
import { LOG_LIMIT } from "../client-logger";

const LogsInstructions = () => {
  return (
    <Section.Description
      title="Logs"
      description={
        <>
          <Text as="p" marginBottom={8}>
            Taxes App records all API calls and responses. You can use this information to debug
            issues with your provider.
          </Text>
          <Text as="p" marginBottom={8}>
            Only the last {LOG_LIMIT} logs are stored.
          </Text>
          <Text as="p" marginBottom={8}>
            The naming convention for each event is: <b>[WebhookName] API method name</b>.
          </Text>
        </>
      }
    />
  );
};
const Header = () => {
  return <Section.Header>Display logs for your configuration</Section.Header>;
};

export const ClientLogsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <AppPageLayout
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
        {
          href: "/providers",
          label: "Providers",
        },
        {
          href: "/providers/avatax",
          label: "AvaTax",
        },
        {
          href: `/providers/avatax/${id}`,
          label: String(id),
        },
        {
          href: `/providers/avatax/${id}/logs`,
          label: "Logs",
        },
      ]}
      top={<Header />}
    >
      <LogsInstructions />
      <Provider>
        <ClientLogs />
      </Provider>
    </AppPageLayout>
  );
};
