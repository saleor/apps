import { useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { Box, Spinner, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "urql";

import { ProductTaxClassDocument } from "../../generated/graphql";
import { resolveProductTaxCode } from "../modules/avatax/tax-code/resolve-product-tax-code";
import { trpcClient } from "../modules/trpc/trpc-client";

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

const ProductDetailsWidget = () => {
  const router = useRouter();
  const rootRef = React.useRef<HTMLDivElement>(null);

  useWidgetAutoResize(rootRef);

  const productId = router.query.productId as string | undefined;

  const [{ data, fetching, error }] = useQuery({
    query: ProductTaxClassDocument,
    variables: { id: productId ?? "" },
    pause: !productId,
  });

  const { data: matches, isLoading: matchesLoading } = trpcClient.avataxMatches.getAll.useQuery();

  if (!productId) {
    return (
      <Box ref={rootRef}>
        <Text color="critical1">Open this widget from a product&apos;s detail page.</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box ref={rootRef}>
        <Text color="critical1">Failed to load product: {error.message}</Text>
      </Box>
    );
  }

  if ((fetching && !data) || matchesLoading) {
    return (
      <Box ref={rootRef} display="flex" justifyContent="center" padding={4}>
        <Spinner />
      </Box>
    );
  }

  const resolution = resolveProductTaxCode(data?.product?.taxClass, matches ?? []);

  return (
    <Box ref={rootRef} display="grid" gap={3}>
      <Text size={4} fontWeight="bold">
        AvaTax tax code
      </Text>

      {resolution.status === "assigned" && (
        <>
          <Row label="Tax class">{resolution.taxClassName}</Row>
          <Row label="AvaTax tax code">{resolution.avataxTaxCode}</Row>
          <Text size={2} color="success1">
            This product is taxed with the mapped AvaTax code.
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

export default ProductDetailsWidget;
