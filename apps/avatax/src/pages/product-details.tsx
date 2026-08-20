import { actions, useAppBridge, useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Spinner, Text } from "@saleor/macaw-ui";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "urql";

import { ProductTaxClassDocument } from "../../generated/graphql";
import {
  PRODUCT_TAX_CODE_POPUP_IDENTIFIER,
  type ProductTaxCodePopupParams,
} from "../modules/avatax/tax-code/product-tax-code-popup";
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
 * Opens the popup extension declared under {@link PRODUCT_TAX_CODE_POPUP_IDENTIFIER}.
 *
 * The widget iframe is only as tall as its content, so a combobox here would have its
 * dropdown clipped by the iframe edge. Editing lives in the modal instead, which has
 * the room for it.
 */
const EditTaxCodeButton = ({ productId }: { productId: string }) => {
  const { appBridge } = useAppBridge();
  const { notifyError } = useDashboardNotification();

  const params: ProductTaxCodePopupParams = { productId };

  return (
    <Button
      variant="secondary"
      onClick={() =>
        appBridge
          ?.dispatch(
            actions.OpenPopup({
              extensionIdentifier: PRODUCT_TAX_CODE_POPUP_IDENTIFIER,
              params,
            }),
          )
          .catch(() =>
            /*
             * `openPopup` is a no-op on Dashboards that don't handle the action, and
             * dispatch rejects when the extension can't be resolved. Say so rather
             * than leaving a button that silently does nothing.
             */
            notifyError("Could not open", "Edit the tax code from the app configuration instead."),
          )
      }
    >
      Edit tax code
    </Button>
  );
};

/**
 * Read-only summary in the product detail sidebar. Stays compact - the Dashboard
 * renders it inline and sizes the iframe to its content.
 */
const WidgetView = ({
  resolution,
  isConfigured,
  productId,
}: {
  resolution: ProductTaxCodeResolution;
  isConfigured: boolean;
  productId: string;
}) => {
  const { appBridge } = useAppBridge();

  if (resolution.status === "no-tax-class") {
    return (
      <>
        <Row label="Tax class">None</Row>
        <Text size={2} color="warning1">
          This product has no tax class, so AvaTax&apos;s default code will be used.
        </Text>
      </>
    );
  }

  return (
    <>
      <Row label="Tax class">{resolution.taxClassName}</Row>
      <Row label="AvaTax tax code">
        {resolution.status === "assigned" ? (
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
        ) : (
          "Not mapped"
        )}
      </Row>

      {resolution.status === "assigned" ? (
        <Text size={2} color="default2">
          ✓ Taxed with the mapped AvaTax code.
        </Text>
      ) : (
        <Text size={2} color="warning1">
          This tax class has no AvaTax code mapped, so AvaTax&apos;s default code will be used.
        </Text>
      )}

      {isConfigured ? (
        <EditTaxCodeButton productId={productId} />
      ) : (
        <Text size={2} color="warning1">
          Connect AvaTax credentials in the app configuration to change this mapping.
        </Text>
      )}
    </>
  );
};

/**
 * The modal behind both the command palette action and the widget's "Edit tax code"
 * button. Unlike the widget it has room to act, so the code is editable here.
 */
const PopupView = ({
  resolution,
  isConfigured,
}: {
  resolution: ProductTaxCodeResolution;
  isConfigured: boolean;
}) => {
  const { appBridge, appBridgeState } = useAppBridge();
  const appId = appBridgeState?.id;

  return (
    <>
      <AppCard display="grid" gap={5}>
        {resolution.status === "no-tax-class" && (
          <>
            <Row label="Tax class">None</Row>
            <Text size={2} color="warning1">
              This product has no tax class, so AvaTax&apos;s default code will be used. Assign it a
              tax class before mapping a code.
            </Text>
          </>
        )}

        {resolution.status !== "no-tax-class" && (
          <>
            <Row label="Tax class">{resolution.taxClassName}</Row>
            {isConfigured ? (
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
                  /*
                   * The product behind this modal still shows the old code - in its own
                   * tax section and in the sidebar widget - so ask the Dashboard to
                   * reload the entity rather than leaving it stale until a manual
                   * refresh. Fire-and-forget: the mapping is already saved, so a
                   * Dashboard that does not handle the action must not surface an error.
                   */
                  onSaved={() => {
                    appBridge?.dispatch(actions.RefreshEntity()).catch(() => {});
                  }}
                />
                <Text size={2} color="default2">
                  Mapping is per tax class, so this applies to every product in{" "}
                  {resolution.taxClassName} - not only this one.
                </Text>
              </Box>
            ) : (
              <>
                <Row label="AvaTax tax code">
                  {resolution.status === "assigned" ? resolution.avataxTaxCode : "Not mapped"}
                </Row>
                <Text size={2} color="warning1">
                  Connect AvaTax credentials in the app configuration to change this mapping.
                </Text>
              </>
            )}
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
    </>
  );
};

const ProductDetailsWidget = () => {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { appBridgeState } = useAppBridge();

  /*
   * The popup extensions point at this same route with `mode=popup`, so one page
   * serves the sidebar widget and the modal.
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

  /*
   * Mounts carry the entity context as `productId`, but `openPopup` carries none - it
   * only forwards the app's own payload - so the widget passes the id through there.
   */
  const appParams = appBridgeState?.appParams as ProductTaxCodePopupParams | undefined;
  const productId = (router.query.productId as string | undefined) ?? appParams?.productId;

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
  const gap = isPopup ? 5 : 3;

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

  return (
    <Box ref={rootRef} padding={padding} display="grid" gap={gap}>
      {isPopup ? (
        <PopupView resolution={resolution} isConfigured={isConfigured} />
      ) : (
        <WidgetView resolution={resolution} isConfigured={isConfigured} productId={productId} />
      )}
    </Box>
  );
};

export default ProductDetailsWidget;
