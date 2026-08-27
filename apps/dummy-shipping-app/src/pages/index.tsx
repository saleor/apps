import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import Link from "next/link";
import { type MouseEventHandler, useEffect, useState } from "react";

const AddToSaleorForm = () => (
  <Box
    as="form"
    display="flex"
    alignItems="flex-end"
    gap={4}
    onSubmit={(event) => {
      event.preventDefault();

      const saleorUrl = new FormData(event.currentTarget as HTMLFormElement).get("saleor-url");
      const manifestUrl = new URL("/api/manifest", window.location.origin);
      const redirectUrl = new URL(
        `/dashboard/apps/install?manifestUrl=${manifestUrl}`,
        saleorUrl as string,
      ).href;

      window.open(redirectUrl, "_blank");
    }}
  >
    <Input type="url" required label="Saleor URL" name="saleor-url" />
    <Button type="submit">Add to Saleor</Button>
  </Box>
);

const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    /**
     * In iframe, link can't be opened in new tab, so Dashboard must be a proxy
     */
    if (appBridgeState?.ready) {
      e.preventDefault();

      appBridge?.dispatch(
        actions.Redirect({
          newContext: true,
          to: e.currentTarget.href,
        }),
      );
    }
  };

  const isLocalHost = global.location.href.includes("localhost");

  return (
    <Box padding={8} display="grid" gap={4} __maxWidth="640px">
      <Text as="h1" size={11}>
        Welcome to Dummy Shipping App
      </Text>
      <Text as="p" color="default2">
        Demonstrates how a Saleor App can serve shipping methods from a third-party shipping API,
        using the SHIPPING_LIST_METHODS_FOR_CHECKOUT and ORDER_FILTER_SHIPPING_METHODS sync
        webhooks.
      </Text>
      <Text as="p">
        Read the{" "}
        <a
          href="https://github.com/saleor/apps/tree/main/apps/dummy-shipping-app"
          onClick={handleLinkClick}
        >
          README
        </a>{" "}
        to learn how to run the full checkout flow.
      </Text>

      {appBridgeState?.ready && mounted && (
        <Box display="grid" gap={2}>
          <Text as="p">
            After you complete the checkout flow (create and complete checkout), open the order to
            see the delivery method this app returned:
          </Text>
          <Link href="/actions">
            <Button variant="secondary">See order details</Button>
          </Link>
        </Box>
      )}

      {mounted && !isLocalHost && !appBridgeState?.ready && (
        <Box display="grid" gap={2}>
          <Text as="p">Install this app in your Dashboard to try it out.</Text>
          <AddToSaleorForm />
        </Box>
      )}
    </Box>
  );
};

export default IndexPage;
