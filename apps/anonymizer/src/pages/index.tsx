import { Layout } from "@saleor/apps-ui";
import { Box, Paragraph, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";

import { BulkAnonymizeSection } from "@/modules/anonymize/bulk-anonymize-section";
import { ScrambleAllOrdersByEmail } from "@/modules/anonymize/scramble-orders-by-email";

const IndexPage: NextPage = () => {
  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Box
        backgroundColor="warning1"
        padding={5}
        borderRadius={4}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Text fontWeight="bold">⚠️ GDPR erasure may not be exhaustive</Text>
        <Text>
          This extension anonymizes data available through the standard orders, customers and
          addresses APIs. It does not inspect or erase custom PII stored elsewhere, such as
          metadata, plugins/extensions, external systems, exports, or third-party integrations (such
          as payment providers).
        </Text>
      </Box>

      <Layout.AppSection
        heading="Anonymize a single customer"
        sideContent={
          <>
            <Paragraph>
              Look up a customer by email, then scramble the personal data on all of their orders
              and delete the customer account.
            </Paragraph>
            <Paragraph>
              Use this for one-off, targeted requests (e.g. a GDPR erasure request).
            </Paragraph>
          </>
        }
      >
        <Layout.AppSectionCard>
          <ScrambleAllOrdersByEmail />
        </Layout.AppSectionCard>
      </Layout.AppSection>

      <Layout.AppSection
        heading="Bulk anonymize"
        sideContent={
          <>
            <Paragraph>
              Scan your entire store, then anonymize every order that hasn&apos;t been processed yet
              and/or delete all customer accounts.
            </Paragraph>
            <Paragraph>
              Orders that have already been anonymized are skipped. Staff accounts are never counted
              or deleted.
            </Paragraph>
            <Paragraph>This runs in your browser - keep this tab open until it finishes.</Paragraph>
          </>
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
