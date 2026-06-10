import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";

import { BulkAnonymizeSection } from "@/modules/anonymize/bulk-anonymize-section";
import { ScrambleAllOrdersByEmail } from "@/modules/anonymize/scramble-orders-by-email";

const IndexPage: NextPage = () => {
  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Layout.AppSection
        heading="Anonymize a single customer"
        sideContent={
          <Text>
            Look up a customer by email, then scramble the personal data on all of their orders and
            delete the customer account. Use this for one-off, targeted requests (e.g. a GDPR
            erasure request).
          </Text>
        }
      >
        <Layout.AppSectionCard>
          <ScrambleAllOrdersByEmail />
        </Layout.AppSectionCard>
      </Layout.AppSection>

      <Layout.AppSection
        heading="Bulk anonymize"
        sideContent={
          <Text>
            Scan your entire store, then anonymize every order that hasn&apos;t been processed yet
            and/or delete all customer accounts. Orders that have already been anonymized are
            skipped. Staff accounts are never counted or deleted. This runs in your browser - keep
            this tab open until it finishes.
          </Text>
        }
      >
        <Layout.AppSectionCard>
          <BulkAnonymizeSection />
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};

export default IndexPage;
