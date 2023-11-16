import { Box, Text } from "@saleor/macaw-ui";
import { AvataxTaxCodeMatcherTable } from "../../../modules/avatax/ui/avatax-tax-code-matcher-table";
import { AppColumns } from "../../../modules/ui/app-columns";
import { AppDashboardLink } from "../../../modules/ui/app-dashboard-link";
import { Section } from "../../../modules/ui/app-section";
import { TextLink } from "@saleor/apps-ui";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { trpcClient } from "../../../modules/trpc/trpc-client";

const Header = () => {
  return <Section.Header>Match Saleor tax classes to AvaTax tax codes</Section.Header>;
};

const Description = () => {
  return (
    <Section.Description
      title="AvaTax tax code matcher"
      description={
        <>
          <Text display="block" as="span" marginBottom={4}>
            To extend the base tax rate of your products, you can map Saleor tax classes to AvaTax
            tax codes.
          </Text>
          <Text display="block" as="span" marginBottom={4}>
            This way, the product&apos;s Saleor tax class will be used to determine the AvaTax tax
            code needed to calculate the tax rate.
          </Text>
          <Text as="p" marginBottom={4}>
            If you haven&apos;t created any tax classes yet, you can do it in the{" "}
            <AppDashboardLink
              data-testid="avatax-matcher-tax-classes-text-link"
              href="/taxes/tax-classes"
            >
              Configuration → Taxes → Tax classes
            </AppDashboardLink>{" "}
            view.
          </Text>
          <Text as="p" marginBottom={4}>
            To learn more about AvaTax tax codes, please visit{" "}
            <TextLink href="https://taxcode.avatax.avalara.com/search?q=OF400000" newTab>
              AvaTax documentation
            </TextLink>
            .
          </Text>
        </>
      }
    />
  );
};

const AvataxMatcher = () => {
  const router = useRouter();
  const { notifyError } = useDashboardNotification();

  const { isLoading } = trpcClient.avataxConnection.verifyConnections.useQuery(undefined, {
    onError: () => {
      notifyError("Error", "You must configure AvaTax first.");
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
      <AvataxTaxCodeMatcherTable />
    </AppColumns>
  );
};

export default AvataxMatcher;
