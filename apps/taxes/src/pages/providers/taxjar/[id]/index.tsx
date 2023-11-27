import { Box, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { EditTaxJarConfiguration } from "../../../../modules/taxjar/ui/edit-taxjar-configuration";
import { TaxJarInstructions } from "../../../../modules/taxjar/ui/taxjar-instructions";
import { AppPageLayout } from "../../../../modules/ui/app-page-layout";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Edit your existing TaxJar configuration
      </Text>
    </Box>
  );
};

const EditTaxJarPage = () => {
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
      ]}
      top={<Header />}
    >
      <TaxJarInstructions />
      <EditTaxJarConfiguration />
    </AppPageLayout>
  );
};

export default EditTaxJarPage;
