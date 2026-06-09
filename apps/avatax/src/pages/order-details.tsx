import {
  useAppBridge,
  useAuthenticatedFetch,
  useWidgetAutoResize,
} from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { type OrderDetailsResponse } from "@/modules/order-details/order-details.types";

const parseOrderId = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
};

const OrderDetailsPage = () => {
  const router = useRouter();
  const { appBridgeState } = useAppBridge();
  const authenticatedFetch = useAuthenticatedFetch();
  const rootRef = useRef<HTMLDivElement>(null);
  const orderId = router.isReady ? parseOrderId(router.query.orderId) : undefined;
  const isBridgeReady = Boolean(appBridgeState?.ready && appBridgeState?.token);

  const [data, setData] = useState<OrderDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useWidgetAutoResize(rootRef);

  useEffect(() => {
    if (!orderId || !isBridgeReady) {
      return undefined;
    }

    let cancelled = false;

    const loadOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await authenticatedFetch(
          `/api/order-details?orderId=${encodeURIComponent(orderId)}`,
        );

        if (response.status === 202) {
          if (!cancelled) {
            setData({ applicable: false });
          }

          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const json = (await response.json()) as OrderDetailsResponse;

        if (!cancelled) {
          setData(json);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load transaction details.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [authenticatedFetch, isBridgeReady, orderId]);

  const renderContent = () => {
    if (!router.isReady || (orderId && !isBridgeReady)) {
      return <Text>Loading transaction details...</Text>;
    }

    if (!orderId) {
      return <Text>Open an order to view AvaTax transaction details.</Text>;
    }

    if (isLoading) {
      return <Text>Loading transaction details...</Text>;
    }

    if (error) {
      return <Text>{error}</Text>;
    }

    if (!data?.applicable) {
      return null;
    }

    const fields = [
      { key: "exemptNo", value: data.exemptNo },
      { key: "totalExempt", value: data.totalExempt },
      { key: "totalTaxable", value: data.totalTaxable },
    ] as const;

    return (
      <>
        {fields.map(({ key, value }) => (
          <Box key={key} marginBottom={2} display="flex" justifyContent="space-between">
            <Text as="span" fontWeight="bold">
              {key}:
            </Text>
            <Text as="span">{value.length ? value : "n/a"}</Text>
          </Box>
        ))}
      </>
    );
  };

  return (
    <Box ref={rootRef} className="order-details-widget-embed" paddingTop={4}>
      {renderContent()}
    </Box>
  );
};

export default OrderDetailsPage;
