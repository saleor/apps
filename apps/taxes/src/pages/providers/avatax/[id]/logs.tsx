import { Provider } from "jotai";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { AvataxLogs } from "../../../../modules/avatax/logs/ui/avatax-logs";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";

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
          label: "TaxJar",
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
        <AvataxLogs />
      </Provider>
    </AppPageLayout>
  );
};

export default LogsAvataxPage;
