import { Text } from "@saleor/macaw-ui";
import { Provider } from "jotai";
import { Section } from "../../ui/app-section";
import { LOG_LIMIT } from "../client-logger";
import { ClientLogs } from "./client-logs";

const LogsInstructions = () => {
  return (
    <Section.Description
      description={
        <>
          <Text as="p" marginBottom={8}>
            Taxjar App records all failed API calls and responses. You can use this information to
            debug issues with your provider.
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

export const ClientLogsPage = () => {
  return (
    <>
      <LogsInstructions />
      <Provider>
        <ClientLogs />
      </Provider>
    </>
  );
};
