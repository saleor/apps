import { Text } from "@saleor/macaw-ui";

import { LogsBrowser } from "@/modules/client-logs/ui/logs-browser";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { Section } from "@/modules/ui/app-section";

export const LogsRootSection = () => {
  /**
   * Logs are enabled conditionally, so only render anything is the feature is on
   */
  const { data } = trpcClient.clientLogs.isEnabled.useQuery();

  if (!data) {
    return null;
  }

  // TODO: Add suspense and dynamic import if logs feature is enabled

  return (
    <>
      <Section.Description
        title="Logs"
        description={
          <>
            <Text>
              Fetch logs (last 100) in the specific time period - or by given Order or Checkout ID
            </Text>
          </>
        }
      />
      <LogsBrowser />
    </>
  );
};
