import { Provider } from "jotai";
import { AppColumns } from "../../../../modules/ui/app-columns";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";
import { LogsTable } from "../../../../modules/avatax/logs/ui/logs-table";
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
  const { data = [], isLoading } = trpcClient.avataxClientLogs.getAll.useQuery();

  return (
    <main>
      <AppColumns top={<Header />}>
        <LogsInstructions />
        <Provider>
          <section>
            <h1>Logs</h1>
            <LogsTable logs={data} />
          </section>
        </Provider>
      </AppColumns>
    </main>
  );
};

export default LogsAvataxPage;
