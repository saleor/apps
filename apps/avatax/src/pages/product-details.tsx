import { actions, useAppBridge, useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Spinner, Text } from "@saleor/macaw-ui";
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

/**
 * Tax class and the AvaTax code it maps to. The code is editable, but only once
 * AvaTax credentials exist - the combobox searches codes through the configured
 * connection, so without one it is an empty box that cannot be typed into.
 */
const TaxCodeFields = ({
  resolution,
  isConfigured,
}: {
  resolution: ProductTaxCodeResolution;
  isConfigured: boolean;
}) => {
  if (resolution.status === "no-tax-class") {
    return (
      <>
        <Row label="Tax class">None</Row>
        <Text size={2} color="warning1">
          This product has no tax class, so AvaTax&apos;s default code will be used. Assign it a tax
          class before mapping a code.
        </Text>
      </>
    );
  }

  if (!isConfigured) {
    return (
      <>
        <Row label="Tax class">{resolution.taxClassName}</Row>
        <Row label="AvaTax tax code">
          {resolution.status === "assigned" ? resolution.avataxTaxCode : "Not mapped"}
        </Row>
        <Text size={2} color="warning1">
          Connect AvaTax credentials in the app configuration to change this mapping.
        </Text>
      </>
    );
  }

  return (
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
          Mapping is per tax class, so this applies to every product in {resolution.taxClassName} -
          not only this one.
        </Text>
      </Box>
    </>
  );
};

const OpenAppButton = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const appId = appBridgeState?.id;

  return (
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

  /*
   * Widget iframes are sized by the height this reports; the popup iframe is already
   * `height: 100%` of the Dashboard's modal and must be left alone.
   *
   * Waiting for `router.isReady` matters as much as the mode check: query params are
   * empty on the first render of a statically optimized page, so enabling this any
   * earlier reports the height of the pre-hydration state as an inline style - which
   * overrides the popup's `height: 100%` and never gets corrected once the hook is
   * disabled, leaving the modal clipped.
   */
  useWidgetAutoResize(rootRef, router.isReady && !isPopup);

  const productId = router.query.productId as string | undefined;

  const [{ data, fetching, error }] = useQuery({
    query: ProductTaxClassDocument,
    variables: { id: productId ?? "" },
    pause: !productId,
  });

  const { data: matches, isLoading: matchesLoading } = trpcClient.avataxMatches.getAll.useQuery();

  /*
   * The combobox resolves tax codes through the first AvaTax connection, so with no
   * connection configured it renders but can never return an option.
   */
  const { data: providers, isLoading: providersLoading } =
    trpcClient.providersConfiguration.getAll.useQuery();

  /*
   * The Dashboard pads widget iframes for us but gives the popup a full-bleed frame,
   * so the modal has to inset its own content.
   */
  const padding = isPopup ? 6 : 0;

  if (!router.isReady) {
    return <Box ref={rootRef} padding={padding} />;
  }

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

  if ((fetching && !data) || matchesLoading || providersLoading) {
    return (
      <Box ref={rootRef} padding={padding} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  const resolution = resolveProductTaxCode(data?.product?.taxClass, matches ?? []);
  const isConfigured = (providers?.length ?? 0) > 0;

  if (!isPopup) {
    return (
      <Box ref={rootRef} display="grid" gap={3}>
        <TaxCodeFields resolution={resolution} isConfigured={isConfigured} />
      </Box>
    );
  }

  return (
    <Box ref={rootRef} padding={padding} display="grid" gap={5}>
      <AppCard display="grid" gap={5}>
        <TaxCodeFields resolution={resolution} isConfigured={isConfigured} />
      </AppCard>
      <OpenAppButton />
    </Box>
  );
};

export default ProductDetailsWidget;
