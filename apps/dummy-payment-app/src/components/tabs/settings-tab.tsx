import { Box, Text } from "@saleor/macaw-ui";

import { SectionWithDescription } from "@/components/section-with-description";
import { StatusCard } from "@/components/status-card";
import { transactionEventTypeSchema } from "@/modules/validation/common";

const WEBHOOK_COUNT = 6;
const EVENT_TYPE_COUNT = transactionEventTypeSchema.options.length;

const WEBHOOKS = [
  { name: "PAYMENT_GATEWAY_INITIALIZE_SESSION", description: "Returns gateway readiness" },
  {
    name: "TRANSACTION_INITIALIZE_SESSION",
    description: "Initial transaction response with configurable event type",
  },
  {
    name: "TRANSACTION_PROCESS_SESSION",
    description: "Process-step response with configurable event type",
  },
  { name: "TRANSACTION_CHARGE_REQUESTED", description: "Handles charge requests from Saleor" },
  {
    name: "TRANSACTION_REFUND_REQUESTED",
    description: "Handles refund requests with amount validation",
  },
  { name: "TRANSACTION_CANCELATION_REQUESTED", description: "Handles cancel requests" },
];

export function SettingsTab() {
  const manifestUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/manifest` : "/api/manifest";

  return (
    <Box display="grid" gap={8}>
      <Box>
        <Text as="h1" size={6} fontWeight="bold">
          Settings
        </Text>
        <Text size={3} color="default2" marginTop={2}>
          Gateway status and integration reference.
        </Text>
      </Box>

      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }} gap={4}>
        <StatusCard
          title="Gateway"
          status="active"
          value="Dummy Payment"
          description="Registered payment app for your Saleor instance"
        />
        <StatusCard
          title="Webhooks"
          status="connected"
          value={`${WEBHOOK_COUNT}/${WEBHOOK_COUNT}`}
          description="Sync webhooks for initialize, process, charge, refund, and cancel"
        />
        <StatusCard
          title="Event types"
          status="active"
          value={`${EVENT_TYPE_COUNT}`}
          description="Configurable CHARGE_* and AUTHORIZATION_* outcomes"
        />
      </Box>

      <SectionWithDescription
        title="Webhooks"
        description={
          <Text size={3} color="default2">
            Six sync webhooks are registered when the app is installed. They respond synchronously
            during checkout and transaction actions.
          </Text>
        }
      >
        <Box display="grid" gap={2}>
          {WEBHOOKS.map((webhook) => (
            <Box
              key={webhook.name}
              padding={4}
              borderRadius={4}
              borderStyle="solid"
              borderWidth={1}
              borderColor="default1"
              display="grid"
              gap={1}
            >
              <Text size={3} fontWeight="bold" style={{ fontFamily: "monospace" }}>
                {webhook.name}
              </Text>
              <Text size={2} color="default2">
                {webhook.description}
              </Text>
            </Box>
          ))}
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Event types"
        description={
          <Text size={3} color="default2">
            Pass one of these in the{" "}
            <Text size={2} style={{ fontFamily: "monospace" }}>
              data.event.type
            </Text>{" "}
            field on initialize or process to control the gateway outcome.
          </Text>
        }
      >
        <Box display="grid" gridTemplateColumns={{ desktop: 2, mobile: 1 }} gap={2}>
          {transactionEventTypeSchema.options.map((eventType) => (
            <Box
              key={eventType}
              padding={3}
              borderRadius={4}
              borderStyle="solid"
              borderWidth={1}
              borderColor="default1"
            >
              <Text size={2} style={{ fontFamily: "monospace" }}>
                {eventType}
              </Text>
            </Box>
          ))}
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Response fields"
        description={
          <Text size={3} color="default2">
            Each transaction webhook response can include:
          </Text>
        }
      >
        <Box display="grid" gap={2}>
          {[
            { field: "pspReference", desc: "UUID v7 when includePspReference is true" },
            { field: "result", desc: "Mirrors the requested event type" },
            { field: "actions", desc: "Available actions (CHARGE, REFUND, CANCEL) based on state" },
            { field: "externalUrl", desc: "Link to the Event reporter for this transaction" },
            { field: "message", desc: "Human-readable success or error message" },
          ].map((item) => (
            <Box key={item.field} display="flex" gap={2} alignItems="baseline">
              <Text
                size={2}
                fontWeight="bold"
                style={{ fontFamily: "monospace", minWidth: "140px" }}
              >
                {item.field}
              </Text>
              <Text size={2} color="default2">
                {item.desc}
              </Text>
            </Box>
          ))}
        </Box>
      </SectionWithDescription>

      <SectionWithDescription
        title="Manifest"
        description={
          <Text size={3} color="default2">
            Install the app in Saleor Dashboard using this manifest URL.
          </Text>
        }
      >
        <Box
          padding={4}
          borderRadius={4}
          borderStyle="solid"
          borderWidth={1}
          borderColor="default1"
        >
          <Text size={2} style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
            {manifestUrl}
          </Text>
        </Box>
      </SectionWithDescription>
    </Box>
  );
}
