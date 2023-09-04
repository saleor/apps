import { Box, Text } from "@saleor/macaw-ui/next";
import { EditTaxJarConfiguration } from "../../../modules/taxjar/ui/edit-taxjar-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";
import { TaxJarInstructions } from "../../../modules/taxjar/ui/taxjar-instructions";
import { AppPageLayout } from "../../../modules/ui/app-page-layout";
import { useRouter } from "next/router";

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
