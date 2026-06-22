import { Box, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import { useRouter } from "next/router";

import { GdprRemovalView } from "@/modules/anonymize/gdpr-removal/gdpr-removal-view";

/**
 * Popup opened from a customer's detail page (CUSTOMER_DETAILS_MORE_ACTIONS).
 * The Dashboard renders this route in an iframe and passes the customer id as
 * the `customerId` query parameter. Note: the `id` param is reserved by the
 * Dashboard for the app's own id (AppBridge), so it must not be used here.
 */
const GdprRemovalPage: NextPage = () => {
  const router = useRouter();
  const { customerId: customerIdParam } = router.query;
  const customerId = typeof customerIdParam === "string" ? customerIdParam : null;

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Text size={7} fontWeight="bold">
          GDPR removal
        </Text>
        <Text as="p">
          This permanently removes the customer&apos;s personal data: their orders are anonymized
          (names, phone and street address scrambled), and their checkouts, gift cards and account
          are deleted. Deleting a gift card also destroys its remaining balance. These actions
          cannot be undone.
        </Text>
        <Text as="p" size={2}>
          This covers data in the standard orders, checkouts and gift cards APIs. It does not erase
          PII held elsewhere, such as metadata, exports or third-party integrations.
        </Text>
      </Box>

      {/* router.query is empty until the router is ready, so wait before reading the id. */}
      {!router.isReady ? (
        <Text>Loading…</Text>
      ) : customerId ? (
        <GdprRemovalView customerId={customerId} />
      ) : (
        <Text color="critical1">
          No customer id was provided. Open this from a customer&apos;s detail page in the
          Dashboard.
        </Text>
      )}
    </Box>
  );
};

export default GdprRemovalPage;
