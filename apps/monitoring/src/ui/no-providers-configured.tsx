import { Box, Button, Text } from "@saleor/macaw-ui/next";
import Link from "next/link";

export const NoProvidersConfigured = () => (
  <Box>
    <Text as={"h1"} variant="heading" marginBottom={4}>
      No providers configured
    </Text>
    <Text marginBottom={4} as={"p"}>
      You need to configure Datadog to enable the app
    </Text>
    <Link href={"/configuration/datadog"}>
      <Button>Configure Datadog</Button>
    </Link>
  </Box>
);
