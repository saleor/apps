import { actions, useAppBridge, useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Spinner, Text } from "@saleor/macaw-ui";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "urql";

import { ProductTaxClassDocument } from "../../generated/graphql";
import {
  type ProductTaxCodeResolution,
  resolveProductTaxCode,
} from "../modules/avatax/tax-code/resolve-product-tax-code";
import { TaxCodeCombobox } from "../modules/avatax/ui/tax-code-combobox";
import { trpcClient } from "../modules/trpc/trpc-client";
import { AppCard } from "../modules/ui/app-card";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box display="flex" justifyContent="space-between" gap={4}>
    <Text as="span" color="default2">
      {label}
    </Text>
    <Text as="span" fontWeight="bold" textAlign="right">
      {children}
    </Text>
  </Box>
);

const AVALARA_TAX_CODE_SEARCH_URL = "https://taxcode.avatax.avalara.com/search?q=";

/**
 * Read-only summary shown in the product detail sidebar. Stays compact: the
 * Dashboard renders it inline and sizes the iframe to its content.
 */
const WidgetView = ({ resolution }: { resolution: ProductTaxCodeResolution }) => {
  const { appBridge } = useAppBridge();

  return (
    <Box display="grid" gap={3}>
      {resolution.status === "assigned" && (
        <>
          <Row label="Tax class">{resolution.taxClassName}</Row>
          <Row label="AvaTax tax code">
            <Box
              as="span"
              className="avatax-tax-code-link"
              display="inline-flex"
              alignItems="center"
              gap={1}
              cursor="pointer"
              color="default1"
              onClick={() =>
                appBridge?.dispatch(
                  actions.Redirect({
                    to: AVALARA_TAX_CODE_SEARCH_URL + encodeURIComponent(resolution.avataxTaxCode),
                    newContext: true,
                  }),
                )
              }
            >
              <Text as="span" fontWeight="bold" color="default1">
                {resolution.avataxTaxCode}
              </Text>
              <ExternalLink size={16} />
            </Box>
          </Row>
          <Text size={2} color="default2">
            ✓ Taxed with the mapped AvaTax code.
          </Text>
        </>
      )}

      {resolution.status === "unmapped" && (
        <>
          <Row label="Tax class">{resolution.taxClassName}</Row>
          <Row label="AvaTax tax code">Not mapped</Row>
          <Text size={2} color="warning1">
            This tax class has no AvaTax code mapped, so AvaTax&apos;s default code will be used.
            Map it in the app configuration to control taxation.
          </Text>
        </>
      )}

      {resolution.status === "no-tax-class" && (
        <>
          <Row label="Tax class">None</Row>
          <Text size={2} color="warning1">
            This product has no tax class, so AvaTax&apos;s default code will be used.
          </Text>
        </>
      )}
    </Box>
  );
};

/**
 * Command palette popup. Unlike the sidebar widget this is a modal with room to
 * act, so the tax code is editable here instead of sending the merchant off to
 * the matcher page to change one mapping.
 */
const PopupView = ({ resolution }: { resolution: ProductTaxCodeResolution }) => {
  const { appBridge, appBridgeState } = useAppBridge();
  const appId = appBridgeState?.id;

  return (
    <Box display="grid" gap={5}>
      <AppCard display="grid" gap={5}>
        {resolution.status === "no-tax-class" ? (
          <>
            <Row label="Tax class">None</Row>
            <Text size={2} color="warning1">
              This product has no tax class, so AvaTax&apos;s default code will be used. Assign it a
              tax class before mapping a code.
            </Text>
          </>
        ) : (
          <>
            <Row label="Tax class">{resolution.taxClassName}</Row>
            <Box display="grid" gap={2}>
              <Text as="span" color="default2">
                AvaTax tax code
              </Text>
              <TaxCodeCombobox
                taxClassId={resolution.taxClassId}
                initialValue={
                  resolution.status === "assigned"
                    ? { label: resolution.avataxTaxCode, value: resolution.avataxTaxCode }
                    : null
                }
              />
              <Text size={2} color="default2">
                Mapping is per tax class, so this applies to every product in{" "}
                {resolution.taxClassName} - not only this one.
              </Text>
            </Box>
          </>
        )}
      </AppCard>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="secondary"
          disabled={!appId}
          onClick={() =>
            appBridge?.dispatch(
              actions.Redirect({ to: `/extensions/app/${encodeURIComponent(appId!)}` }),
            )
          }
        >
          Open app
        </Button>
      </Box>
    </Box>
  );
};

const ProductDetailsWidget = () => {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);

  /*
   * The SEARCH_ACTION extension points at this same route with `mode=popup`, so one
   * page serves the sidebar widget and the command palette modal.
   */
  const isPopup = router.query.mode === "popup";

  // Only widgets are resized to their content; the popup is a fixed-size modal.
  useWidgetAutoResize(rootRef, !isPopup);

  const productId = router.query.productId as string | undefined;

  const [{ data, fetching, error }] = useQuery({
    query: ProductTaxClassDocument,
    variables: { id: productId ?? "" },
    pause: !productId,
  });

  const { data: matches, isLoading: matchesLoading } = trpcClient.avataxMatches.getAll.useQuery();

  /*
   * The Dashboard pads widget iframes for us but gives the popup a full-bleed
   * frame, so the modal has to inset its own content.
   */
  const padding = isPopup ? 6 : 0;

  if (!productId) {
    return (
      <Box ref={rootRef} padding={padding}>
        <Text color="critical1">Open this widget from a product&apos;s detail page.</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box ref={rootRef} padding={padding}>
        <Text color="critical1">Failed to load product: {error.message}</Text>
      </Box>
    );
  }

  if ((fetching && !data) || matchesLoading) {
    return (
      <Box ref={rootRef} padding={padding} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  const resolution = resolveProductTaxCode(data?.product?.taxClass, matches ?? []);

  return (
    <Box ref={rootRef} padding={padding}>
      {isPopup ? <PopupView resolution={resolution} /> : <WidgetView resolution={resolution} />}
    </Box>
  );
};

export default ProductDetailsWidget;
