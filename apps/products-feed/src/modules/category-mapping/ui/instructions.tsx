import { Box, Text } from "@saleor/macaw-ui/next";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import Link from "next/link";

export const Instructions = () => {
  const { appBridge } = useAppBridge();

  return (
    <Box>
      <Text>Using the feed</Text>
      <Text>
        Configure your Google Merchant account to schedule fetches of the feed. Instructions can be
        found{" "}
        <Link
          href="https://support.google.com/merchants/answer/1219255"
          onClick={() => {
            appBridge?.dispatch(
              actions.Redirect({
                to: "https://support.google.com/merchants/answer/1219255",
                newContext: true,
              })
            );
          }}
        >
          here
        </Link>
        .
      </Text>

      <Text>URL templates</Text>
      <Text>
        URLs to products in your storefront are generated dynamically, based on the product data.
        For example, the template
      </Text>
      <code>{"https://example.com/product/{productSlug}"}</code>
      <Text>Will produce</Text>
      <code>{"https://example.com/product/red-t-shirt"}</code>
      <Text>Available fields: productId, productSlug, variantId</Text>
    </Box>
  );
};
