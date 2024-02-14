import { useRouter } from "next/router";
import { ClientLogsPage } from "../../../../modules/logs/ui/client-logs-page";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";
import { Section } from "../../../../modules/ui/app-section";

const Header = () => {
  return <Section.Header>Display logs for your configuration</Section.Header>;
};

const LogsTaxjarPage = () => {
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
      <ClientLogsPage />
    </AppPageLayout>
  );
};

export default LogsTaxjarPage;
