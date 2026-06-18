import { Box, Text } from "@saleor/macaw-ui";
import Link from "next/link";
import type { ReactNode } from "react";

import { APP_ROUTES } from "@/components/app-tabs";
import { TestCardMockup } from "@/components/test-card-mockup";
import { GATEWAY_ID } from "@/lib/gateway-id";

const EXAMPLE_PAYMENT_GATEWAY = `{
  "id": "${GATEWAY_ID}",
  "data": {
    "event": {
      "type": "CHARGE_SUCCESS",
      "includePspReference": true
    }
  }
}`;

function Mono({ children }: { children: ReactNode }) {
  return <Text style={{ fontFamily: "monospace" }}>{children}</Text>;
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} style={{ color: "var(--mu-colors-text-accent1)", textDecoration: "none" }}>
      {children}
    </Link>
  );
}

function BulletItem({ children }: { children: ReactNode }) {
  return (
    <Box display="flex" gap={2} alignItems="flex-start">
      <Text as="span" size={3} color="default2" __flexShrink="0" style={{ lineHeight: 1.6 }}>
        →
      </Text>
      <Text as="p" size={3} color="default2" style={{ lineHeight: 1.6 }}>
        {children}
      </Text>
    </Box>
  );
}

function Step({ number, children }: { number: number; children: ReactNode }) {
  return (
    <Box display="flex" gap={3} alignItems="flex-start">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius={4}
        borderStyle="solid"
        borderWidth={1}
        borderColor="default1"
        __width="24px"
        __height="24px"
        __flexShrink="0"
      >
        <Text size={2} fontWeight="bold">
          {number}
        </Text>
      </Box>
      <Text as="p" size={3} color="default2">
        {children}
      </Text>
    </Box>
  );
}

export function OverviewTab() {
  const capabilities: ReactNode[] = [
    <>
      <Text fontWeight="bold" color="default1">
        Stand in for a real PSP
      </Text>
      {" — call "}
      <Mono>transactionInitialize</Mono>
      {" with gateway "}
      <Mono>{GATEWAY_ID}</Mono>
      {"; sync webhooks return the outcome you set in "}
      <Mono>data.event.type</Mono>
    </>,
    <>
      <Text fontWeight="bold" color="default1">
        Run an end-to-end checkout
      </Text>
      {" — use "}
      <InlineLink href={APP_ROUTES.checkout}>Quick checkout</InlineLink>
      {" to create, initialize, and complete a transaction via GraphQL"}
    </>,
    <>
      <Text fontWeight="bold" color="default1">
        Exercise later stages
      </Text>
      {" — fire charge, refund, and cancel events in "}
      <InlineLink href={APP_ROUTES.transactions}>Event reporter</InlineLink>
      {" or through Saleor's transaction mutations"}
    </>,
  ];

  return (
    <Box className="overview-columns">
      <Box display="grid" gap={10}>
        <Box display="grid" gap={4}>
          <Box display="grid" gap={3}>
            <Text as="h1" size={6} fontWeight="bold">
              Test Saleor&apos;s Transactions API without a PSP
            </Text>
            <Text as="p" size={3} color="default2" style={{ lineHeight: 1.6 }}>
              A sync payment gateway for local development and integration testing.
            </Text>
          </Box>

          <Box as="ul" className="overview-capabilities" __margin="0" __padding="0">
            {capabilities.map((item, index) => (
              <Box as="li" key={index}>
                <BulletItem>{item}</BulletItem>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          padding={5}
          borderRadius={4}
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
        >
          <Box className="transactions-api-callout-inner">
            <Box display="grid" gap={4}>
              <Box display="grid" gap={2}>
                <Text as="h2" size={5} fontWeight="bold">
                  Transactions API
                </Text>
                <Text as="p" size={3} color="default2">
                  Wire your storefront, scripts, or GraphQL client against a real Saleor instance
                  without integrating Stripe, Adyen, or another PSP first.
                </Text>
              </Box>

              <Box display="grid" gap={3}>
                <Step number={1}>
                  Gateway id <Mono>{GATEWAY_ID}</Mono> — already registered while this app is
                  installed. Saleor lists it on <Mono>checkout.availablePaymentGateways</Mono>;
                  there is no separate channel toggle.
                </Step>
                <Step number={2}>
                  Call <Mono>transactionInitialize</Mono> (and <Mono>transactionProcess</Mono> when
                  your flow requires it) with that gateway. Saleor invokes this app&apos;s sync
                  webhooks and returns <Mono>result</Mono>, <Mono>pspReference</Mono>,{" "}
                  <Mono>actions</Mono>, and <Mono>externalUrl</Mono>.
                </Step>
                <Step number={3}>
                  Set <Mono>data.event.type</Mono> to pick the outcome (<Mono>CHARGE_SUCCESS</Mono>,{" "}
                  <Mono>AUTHORIZATION_FAILURE</Mono>, etc.). Use Event reporter or Saleor&apos;s
                  charge/refund/cancel mutations to exercise later stages.
                </Step>
              </Box>
            </Box>

            <Box display="grid" gap={2} alignSelf="start">
              <Text as="p" size={2} color="default2">
                <Mono>paymentGateway</Mono> on <Mono>transactionInitialize</Mono>
              </Text>
              <Box
                padding={4}
                borderRadius={4}
                borderStyle="solid"
                borderWidth={1}
                borderColor="default1"
                backgroundColor="default1"
                __maxWidth="100%"
              >
                <Box
                  as="pre"
                  style={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    fontSize: "13px",
                  }}
                >
                  {EXAMPLE_PAYMENT_GATEWAY}
                </Box>
              </Box>
              <Text as="p" size={2} color="default2">
                Event types and webhook contracts:{" "}
                <InlineLink href={APP_ROUTES.settings}>integration reference</InlineLink>.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box __width="100%" alignSelf="start">
        <TestCardMockup fill />
      </Box>
    </Box>
  );
}
