import { Provider } from "jotai";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { AvataxLogs } from "../../../../modules/avatax/logs/ui/avatax-logs";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";
import { AVATAX_LOG_LIMIT } from "../../../../modules/avatax/logs/avatax-client-logger";

const LogsInstructions = () => {
  return (
    <Section.Description
      title="AvaTax Logs"
      description={
        <>
          <Text as="p" marginBottom={8}>
            Taxes App records all AvaTax API calls and responses. You can use this information to
            debug issues with AvaTax.
          </Text>
          <Text as="p" marginBottom={8}>
            Only the last {AVATAX_LOG_LIMIT} logs are stored.
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
