import { Layout } from "@saleor/apps-ui";
import { Box, Paragraph, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";

import { BulkAnonymizeSection } from "@/modules/anonymize/bulk-anonymize-section";
import { GiftCardsSection } from "@/modules/anonymize/gift-cards-section";
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
          This extension anonymizes data available through the standard orders, customers,
          addresses, checkouts and gift cards APIs. It does not inspect or erase custom PII stored
          elsewhere, such as metadata, plugins/extensions, external systems, exports, or third-party
          integrations (such as payment providers). Deleting checkouts and gift cards is
          irreversible, and deleting a gift card permanently destroys its remaining balance.
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

      <Layout.AppSection
        heading="Gift cards"
        sideContent={
          <>
            <Paragraph>
              Gift card personal data cannot be scrubbed in place, so removing it means deleting the
              card - which permanently destroys its remaining balance.
            </Paragraph>
            <Paragraph>
              Delete a single customer&apos;s gift cards by email for erasure requests, or delete
              all gift cards to sanitize data copied to a dev/staging environment.
            </Paragraph>
            <Paragraph>This runs in your browser - keep this tab open until it finishes.</Paragraph>
          </>
        }
      >
        <Layout.AppSectionCard>
          <GiftCardsSection />
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};

export default IndexPage;
