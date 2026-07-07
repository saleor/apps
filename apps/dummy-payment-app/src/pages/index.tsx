import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { isInIframe } from "@saleor/apps-shared/is-in-iframe";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { CreditCard } from "lucide-react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsMounted } from "usehooks-ts";

import { TestCardMockup } from "@/components/test-card-mockup";

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
  const isMounted = useIsMounted();
  const { replace } = useRouter();
  const { appBridgeState } = useAppBridge();

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/app");
    }
  }, [isMounted, appBridgeState?.ready, replace]);

  if (isInIframe()) {
    return <span>Loading...</span>;
  }

  const isLocalHost = global.location.href.includes("localhost");
  const manifestUrl = typeof window !== "undefined" ? `${window.location.origin}/api/manifest` : "";

  return (
    <Box
      __minHeight="100vh"
      backgroundColor="default1"
      padding={8}
      display="grid"
      gap={8}
      __maxWidth="900px"
      __margin="0 auto"
    >
      <Box display="flex" alignItems="center" gap={3}>
        <CreditCard size={28} style={{ opacity: 0.7 }} />
        <Box>
          <Text as="h1" size={6} fontWeight="bold">
            Dummy Payment App
          </Text>
          <Text size={3} color="default2">
            Test Saleor&apos;s Transactions API without a real payment provider
          </Text>
        </Box>
      </Box>

      <Box display="flex" gap={6} alignItems="flex-start" flexWrap="wrap">
        <Box display="grid" gap={4} __flex="1" __minWidth="240px">
          <Text size={3} color="default2">
            Install this app in your Saleor Dashboard to register a sync payment gateway for local
            development and integration testing.
          </Text>
          <Text size={3} color="default2">
            No card processing — set{" "}
            <Text size={2} style={{ fontFamily: "monospace" }}>
              data.event.type
            </Text>{" "}
            on{" "}
            <Text size={2} style={{ fontFamily: "monospace" }}>
              transactionInitialize
            </Text>{" "}
            to simulate charge, authorization, refund, and cancel flows.
          </Text>
        </Box>
        <TestCardMockup />
      </Box>

      {isMounted() && !isLocalHost && !appBridgeState?.ready && (
        <Box
          display="grid"
          gap={4}
          padding={6}
          borderRadius={4}
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
        >
          <Text size={5} fontWeight="bold">
            Install in Saleor
          </Text>
          <Text size={3} color="default2">
            Manifest URL:{" "}
            <Text size={2} style={{ fontFamily: "monospace" }}>
              {manifestUrl}
            </Text>
          </Text>
          <AddToSaleorForm />
        </Box>
      )}
    </Box>
  );
};

export default IndexPage;
