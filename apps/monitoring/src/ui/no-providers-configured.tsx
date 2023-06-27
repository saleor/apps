import { Box, Button, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";

export const NoProvidersConfigured = () => (
  <Box display={"flex"} gap={4} flexDirection={"column"}>
    <Text as={"h1"} variant="heading">
      No providers configured
    </Text>
    <Text as={"p"}>You need to configure Datadog to enable the app</Text>
    <Link href={"/configuration/datadog"}>
      <Button>Configure Datadog</Button>
    </Link>
  </Box>
);
