import { Provider } from "jotai";
import { Section } from "../../../../modules/ui/app-section";

import { Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { TaxJarLogs } from "../../../../modules/taxjar/logs/ui/taxjar-logs";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";
import { TAXJAR_LOG_LIMIT } from "../../../../modules/taxjar/logs/taxjar-client-logger";

const LogsInstructions = () => {
  return (
    <Section.Description
      title="TaxJar Logs"
      description={
        <>
          <Text as="p" marginBottom={8}>
            Taxes App records all TaxJar API calls and responses. You can use this information to
            debug issues with TaxJar.
          </Text>
          <Text as="p" marginBottom={8}>
            Only the last {TAXJAR_LOG_LIMIT} logs are stored.
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
  return <Section.Header>Display logs for your TaxJar configuration</Section.Header>;
};

const LogsTaxJarPage = () => {
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
          href: "/providers/taxjar",
          label: "TaxJar",
        },
        {
          href: `/providers/taxjar/${id}`,
          label: String(id),
        },
        {
          href: `/providers/taxjar/${id}/logs`,
          label: "Logs",
        },
      ]}
      top={<Header />}
    >
      <LogsInstructions />
      <Provider>
        <TaxJarLogs />
      </Provider>
    </AppPageLayout>
  );
};

export default LogsTaxJarPage;
