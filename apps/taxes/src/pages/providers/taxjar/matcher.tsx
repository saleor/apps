import { Box, Text } from "@saleor/macaw-ui";
import { AppColumns } from "../../../modules/ui/app-columns";
import { AppDashboardLink } from "../../../modules/ui/app-dashboard-link";
import { Section } from "../../../modules/ui/app-section";
import { TextLink } from "@saleor/apps-ui";
import { TaxJarTaxCodeMatcherTable } from "../../../modules/taxjar/ui/taxjar-tax-code-matcher-table";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { useDashboardNotification } from "@saleor/apps-shared";

const Header = () => {
  return <Section.Header>Match Saleor tax classes to TaxJar tax categories</Section.Header>;
};

const Description = () => {
  return (
    <Section.Description
      title="TaxJar tax code matcher"
      description={
        <>
          <Text display="block" as="span" marginBottom={4}>
            To extend the base tax rate of your products, you can map Saleor tax classes to TaxJar
            tax categories.
          </Text>
          <Text display="block" as="span" marginBottom={4}>
            This way, the product&apos;s Saleor tax class will be used to determine the TaxJar tax
            code needed to calculate the tax rate.
          </Text>
          <Text as="p" marginBottom={4}>
            If you haven&apos;t created any tax classes yet, you can do it in the{" "}
            <AppDashboardLink
              data-testid="taxjar-matcher-tax-classes-text-link"
              href="/taxes/tax-classes"
            >
              Configuration → Taxes → Tax classes
            </AppDashboardLink>{" "}
            view.
          </Text>
          <Text as="p" marginBottom={4}>
            To learn more about TaxJar tax categories, please visit{" "}
            <TextLink
              href="https://support.taxjar.com/article/555-what-product-tax-codes-does-taxjar-support"
              newTab
            >
              TaxJar documentation
            </TextLink>
            .
          </Text>
        </>
      }
    />
  );
};

const TaxJarMatcher = () => {
  const router = useRouter();
  const { notifyError } = useDashboardNotification();

  const { isLoading } = trpcClient.taxJarConnection.verifyConnections.useQuery(undefined, {
    onError: () => {
      notifyError("Error", "You must configure TaxJar first.");
      router.push("/configuration");
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <AppColumns top={<Header />}>
      <Description />
      <TaxJarTaxCodeMatcherTable />
    </AppColumns>
  );
};

export default TaxJarMatcher;
