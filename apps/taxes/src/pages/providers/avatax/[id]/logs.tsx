import { Provider } from "jotai";
import { AppColumns } from "../../../../modules/ui/app-columns";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../../../modules/trpc/trpc-client";

const LogsInstructions = () => {
  return (
    <Section.Description
      title="AvaTax Logs"
      description={
        <>
          <Text as="p" marginBottom={8}>
            Here are logs
          </Text>
        </>
      }
    />
  );
};

const Header = () => {
  return <Section.Header>Display logs for your AvaTax configuration</Section.Header>;
};

const LogsAvataxPage = () => {
  const logs = trpcClient.avataxClientLogs.getAll.useQuery();

  return (
    <main>
      <AppColumns top={<Header />}>
        <LogsInstructions />
        <Provider>
          <div>
            <h1>Logs</h1>
            <ul>
              {logs.data?.map((log) => (
                <li style={{ display: "flex", gap: 10 }} key={log.date}>
                  <Text>{log.event}</Text>
                  <Text>{log.date}</Text>
                  <Text>{log.status}</Text>
                </li>
              ))}
            </ul>
          </div>
        </Provider>
      </AppColumns>
    </main>
  );
};

export default LogsAvataxPage;
