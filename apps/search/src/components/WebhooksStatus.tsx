import { Accordion, Box, Text } from "@saleor/macaw-ui/next";
import { EventDeliveryStatusEnum } from "../../generated/graphql";
import { useWebhooksStatus } from "../lib/useWebhooksStatus";
import { SemanticChip } from "@saleor/apps-ui";

export const WebhooksStatus = () => {
  const { data: webhooksData } = useWebhooksStatus();

  if (!webhooksData) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box>
      <Accordion display={"grid"} gap={4}>
        {webhooksData.map((webhook) => {
          const Trigger = webhook.isActive ? Box : Accordion.Trigger;

          const failedEventDeliveries = webhook.eventDeliveries?.edges?.filter(
            (e) => e.node.status === EventDeliveryStatusEnum.Failed
          );

          const hasFailedDeliveries = failedEventDeliveries && failedEventDeliveries.length > 0;

          return (
            <Accordion.Item
              value={webhook.id}
              key={webhook.id}
              borderBottomStyle={"solid"}
              borderColor={"neutralPlain"}
              borderBottomWidth={1}
            >
              <Trigger paddingBottom={4}>
                <Box
                  width={"100%"}
                  display={"grid"}
                  gridTemplateColumns={2}
                  gap={4}
                  alignItems={"center"}
                >
                  <Text size={"small"}>{webhook.asyncEvents[0].name}</Text>
                  {webhook.isActive ? (
                    <SemanticChip marginLeft={"auto"} size={"small"} variant={"success"}>
                      ACTIVE
                    </SemanticChip>
                  ) : (
                    <SemanticChip marginLeft={"auto"} size={"small"} variant={"error"}>
                      DISABLED
                    </SemanticChip>
                  )}
                </Box>
              </Trigger>
              <Accordion.Content>
                <Box marginY={6}>
                  <Text variant={"bodyStrong"}>Delivery attempts</Text>
                  {!hasFailedDeliveries ? (
                    <Box>
                      <Text size={"small"}>No failed deliveries</Text>
                    </Box>
                  ) : null}
                  <Box>
                    {webhook.eventDeliveries?.edges.map((delivery) => (
                      <Box key={delivery.node.id}>
                        {delivery.node.attempts?.edges.map((attempt) => (
                          <Box
                            display={"grid"}
                            gridTemplateColumns={3}
                            gap={3}
                            key={attempt.node.id}
                          >
                            <Text display={"block"} size={"small"}>
                              <Text color={"textNeutralSubdued"}>Status</Text>:{" "}
                              <Text color={"textCriticalSubdued"}>{attempt.node.status}</Text>
                            </Text>
                            <Text display={"block"} size={"small"}>
                              <Text color={"textNeutralSubdued"}>HTTP </Text>
                              <Text color={"textCriticalSubdued"}>
                                {attempt.node.responseStatusCode}
                              </Text>
                            </Text>
                            <Text display={"block"} size={"small"} marginLeft={"auto"}>
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
