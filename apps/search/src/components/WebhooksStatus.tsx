import { SemanticChip } from "@saleor/apps-ui";
import { Accordion, Box, Text } from "@saleor/macaw-ui";

import { EventDeliveryStatusEnum } from "../../generated/graphql";
import { useWebhooksStatus } from "../lib/useWebhooksStatus";
import { useWebhooksUpdateMutation } from "../lib/useWebhooksUpdate";

export const WebhooksStatus = () => {
  const { data } = useWebhooksStatus();
  const updateWebhooksMutation = useWebhooksUpdateMutation();

  if (!data) {
    return <Text>Loading...</Text>;
  }

  const webhooksData = data.webhooks;

  return (
    <Box>
      <Accordion display={"grid"} gap={1.5}>
        {webhooksData.map((webhook) => {
          const failedEventDeliveries = webhook.eventDeliveries?.edges?.filter(
            (e) => e.node.status === EventDeliveryStatusEnum.Failed,
          );

          const hasFailedDeliveries = failedEventDeliveries && failedEventDeliveries.length > 0;

          return (
            <Accordion.Item
              value={webhook.id}
              key={webhook.id}
              borderBottomStyle={"solid"}
              borderColor={"default1"}
              borderBottomWidth={1}
            >
              <Accordion.Trigger paddingBottom={1.5}>
                <Box width={"100%"} display={"flex"} gap={2} alignItems={"center"}>
                  <Text size={3} flexGrow="1">
                    {webhook.asyncEvents[0].name}
                  </Text>
                  {webhook.isActive ? (
                    <SemanticChip marginLeft={"auto"} size="small" variant={"success"}>
                      ACTIVE
                    </SemanticChip>
                  ) : (
                    <SemanticChip marginLeft={"auto"} size="small" variant={"error"}>
                      DISABLED
                    </SemanticChip>
                  )}
                  <Accordion.TriggerButton />
                </Box>
              </Accordion.Trigger>
              <Accordion.Content>
                <Box marginY={3}>
                  <Text size={4} fontWeight="bold">
                    Delivery attempts
                  </Text>
                  {!hasFailedDeliveries ? (
                    <Box>
                      <Text size={3}>No failed deliveries</Text>
                    </Box>
                  ) : null}
                  <Box>
                    {webhook.eventDeliveries?.edges.map((delivery) => (
                      <Box key={delivery.node.id}>
                        {delivery.node.attempts?.edges.map((attempt) => (
                          <Box
                            display={"grid"}
                            gridTemplateColumns={3}
                            gap={1}
                            key={attempt.node.id}
                          >
                            <Text display={"block"} size={3}>
                              <Text color={"default2"}>Status</Text>:{" "}
                              <Text color={"critical2"}>{attempt.node.status}</Text>
                            </Text>
                            <Text display={"block"} size={3}>
                              <Text color={"default2"}>HTTP </Text>
                              <Text color={"critical2"}>{attempt.node.responseStatusCode}</Text>
                            </Text>
                            <Text display={"block"} size={3} marginLeft={"auto"}>
                              {new Date(attempt.node.createdAt).toLocaleString()}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Box>
  );
};
