import { Provider } from "jotai";
import { AppColumns } from "../../../../modules/ui/app-columns";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";

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
  return (
    <main>
      <AppColumns top={<Header />}>
        <LogsInstructions />
        <Provider>Logs</Provider>
      </AppColumns>
    </main>
  );
};

export default LogsAvataxPage;
