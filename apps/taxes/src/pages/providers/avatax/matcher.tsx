import { Text } from "@saleor/macaw-ui/next";
import { AvataxTaxCodeMatcherTable } from "../../../modules/avatax/ui/avatax-tax-code-matcher-table";
import { AppColumns } from "../../../modules/ui/app-columns";
import { AppDashboardLink } from "../../../modules/ui/app-dashboard-link";
import { Section } from "../../../modules/ui/app-section";
import { TextLink } from "@saleor/apps-ui";

const Header = () => {
  return <Section.Header>Match Saleor tax classes to Avatax tax codes</Section.Header>;
};

const Description = () => {
  return (
    <Section.Description
      title="Avatax tax code matcher"
      description={
        <>
          <Text display="block" as="span" marginBottom={4}>
            To extend the base tax rate of your products, you can map Saleor tax classes to Avatax
            tax codes.
          </Text>
          <Text display="block" as="span" marginBottom={4}>
            This way, the product&apos;s Saleor tax class will be used to determine the Avatax tax
            code needed to calculate the tax rate.
          </Text>
          <Text as="p" marginBottom={4}>
            If you haven&apos;t created any tax classes yet, you can do it in the{" "}
            <AppDashboardLink href="/taxes/tax-classes">
              Configuration → Taxes → Tax classes
            </AppDashboardLink>{" "}
            view.
          </Text>
          <Text as="p" marginBottom={4}>
            To learn more about Avatax tax codes, please visit{" "}
            <TextLink href="https://taxcode.avatax.avalara.com/search?q=OF400000" newTab>
              Avatax documentation
            </TextLink>
            .
          </Text>
        </>
      }
    />
  );
};

const AvataxMatcher = () => {
  return (
    <AppColumns top={<Header />}>
      <Description />
      <AvataxTaxCodeMatcherTable />
    </AppColumns>
  );
};

/*
 * todo: add redirect if no connection
 */
export default AvataxMatcher;
