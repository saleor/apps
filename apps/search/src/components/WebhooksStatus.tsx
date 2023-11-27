import { Accordion, Box, Button, Text } from "@saleor/macaw-ui";
import { EventDeliveryStatusEnum } from "../../generated/graphql";
import { useWebhooksStatus } from "../lib/useWebhooksStatus";
import { SemanticChip } from "@saleor/apps-ui";
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
              borderColor={"neutralPlain"}
              borderBottomWidth={1}
            >
              <Accordion.Trigger paddingBottom={1.5}>
                <Box width={"100%"} display={"flex"} gap={2} alignItems={"center"}>
                  <Text size={"small"} flexGrow="1">
                    {webhook.asyncEvents[0].name}
                  </Text>
                  {webhook.isActive ? (
                    <SemanticChip marginLeft={"auto"} size={"small"} variant={"success"}>
                      ACTIVE
                    </SemanticChip>
                  ) : (
                    <SemanticChip marginLeft={"auto"} size={"small"} variant={"error"}>
                      DISABLED
                    </SemanticChip>
                  )}
                  <Accordion.TriggerButton />
                </Box>
              </Accordion.Trigger>
              <Accordion.Content>
                <Box marginY={3}>
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
                            gap={1}
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
      {data.isUpdateNeeded && (
        <Box
          borderTopStyle="solid"
          borderWidth={1}
          borderColor="neutralDefault"
          display="flex"
          gap={4}
          flexDirection="row"
          justifyContent="flex-end"
          alignItems="center"
          paddingTop={4}
        >
          <Text variant="caption">
            New app version installed. Update the webhooks and run product import again.
          </Text>
          <Button onClick={() => updateWebhooksMutation.mutate()}>Update webhooks</Button>
        </Box>
      )}
    </Box>
  );
};
