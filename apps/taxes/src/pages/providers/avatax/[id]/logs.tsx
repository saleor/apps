import { useRouter } from "next/router";
import { ClientLogsPage } from "../../../../modules/logs/ui/client-logs-page";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";
import { Section } from "../../../../modules/ui/app-section";

const Header = () => {
  return <Section.Header>Display logs for your configuration</Section.Header>;
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
      <ClientLogsPage />
    </AppPageLayout>
  );
};

export default LogsAvataxPage;
