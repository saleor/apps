import { Box, Text } from "@saleor/macaw-ui";

interface StatusCardProps {
  title: string;
  status: "connected" | "disconnected" | "loading" | "unknown" | "active";
  value: string;
  description: string;
}

const STATUS_LABELS: Record<StatusCardProps["status"], string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  loading: "Checking...",
  unknown: "Unknown",
  active: "Active",
};

const STATUS_COLORS: Record<StatusCardProps["status"], string> = {
  connected: "#22c55e",
  disconnected: "#ef4444",
  loading: "#a0a0a0",
  unknown: "#a0a0a0",
  active: "#22c55e",
};

export function StatusCard({ title, status, value, description }: StatusCardProps) {
  return (
    <Box
      borderStyle="solid"
      borderWidth={1}
      borderColor="default1"
      borderRadius={4}
      padding={5}
      display="grid"
      gap={2}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text size={3} fontWeight="bold">
          {title}
        </Text>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            as="span"
            borderRadius={4}
            __width="7px"
            __height="7px"
            __backgroundColor={STATUS_COLORS[status]}
            __flexShrink="0"
          />
          <Text size={2} __color={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Text>
        </Box>
      </Box>

      <Text size={10} fontWeight="bold" __lineHeight="1">
        {value}
      </Text>

      <Text size={2} color="default2">
        {description}
      </Text>
    </Box>
  );
}
