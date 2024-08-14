import { Provider } from "jotai";
import { useRouter } from "next/router";

import { AvataxInstructions } from "../../../../modules/avatax/ui/avatax-instructions";
import { EditAvataxConfiguration } from "../../../../modules/avatax/ui/edit-avatax-configuration";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";
import { Section } from "../../../../modules/ui/app-section";

const Header = () => {
  return <Section.Header>Edit your existing AvaTax configuration</Section.Header>;
};

const EditAvataxPage = () => {
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
      ]}
      top={<Header />}
    >
      <AvataxInstructions />
      <Provider>
        <EditAvataxConfiguration />
      </Provider>
    </AppPageLayout>
  );
};

export default EditAvataxPage;
