import { Box, Checkbox, Text, Button } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";
import { ComponentProps, useEffect, useState } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const CustomerCreateEventSettings = (props: ComponentProps<typeof Box>) => {
  const { appBridge } = useAppBridge();

  const { data: mailchimpConfig, status: mailchimpConfigStatus } =
    trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();

  const { mutateAsync, status: savingStatus } =
    trpcClient.mailchimp.config.setWebhookConfig.useMutation();

  const { data: mailchimpLists } = trpcClient.mailchimp.audience.getLists.useQuery();

  const [localState, setLocalState] = useState<
    | {
        selected: true;
        listId: string;
      }
    | {
        selected: false;
      }
    | null
  >(null);

  useEffect(() => {
    if (mailchimpConfigStatus) {
      if (
        mailchimpConfigStatus === "success" &&
        mailchimpConfig.configured &&
        mailchimpConfig.customerCreateEvent
      ) {
        if (mailchimpConfig.customerCreateEvent.enabled) {
          setLocalState({
            selected: true,
            listId: mailchimpConfig.customerCreateEvent.listId,
          });
        } else {
          setLocalState({
            selected: false,
          });
        }
      }
    }
  }, [mailchimpConfigStatus, mailchimpConfig]);

  if (!mailchimpConfig?.configured || !localState || !mailchimpLists) {
    return null;
  }

  const eventConfig = mailchimpConfig.customerCreateEvent;

  return (
    <Box
      {...props}
      padding={8}
      borderColor="neutralHighlight"
      borderWidth={1}
      borderStyle="solid"
      borderRadius={4}
    >
      {/* @ts-ignore todo macaw*/}
      <Text as="h1" variant="title" size="small" marginBottom={4}>
        Configure webhooks
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text color="textNeutralSubdued" as="p" marginBottom={8}>
        Each time customer is created, it will be added to selected audience list in Mailchimp
      </Text>
      <Box display="flex" gap={4} justifyContent="space-between">
        <Checkbox
          onCheckedChange={(v: boolean) => {
            v
              ? setLocalState({
                  selected: true,
                  listId: mailchimpLists[0]?.id,
                })
              : setLocalState({
                  selected: false,
                });
          }}
          checked={localState.selected}
        >
          {/* @ts-ignore todo macaw*/}
          <Text marginRight="auto">Enable customers sync</Text>
        </Checkbox>
        <Box>
          <Text
            color={eventConfig?.enabled ? "textNeutralDefault" : "textNeutralSubdued"}
            /* @ts-ignore todo macaw*/
            marginRight={4}
            variant="caption"
          >
            Sync to the Mailchimp list:
          </Text>
          <select
            disabled={!localState.selected}
            onChange={(e) => {
              setLocalState({
                selected: true,
                listId: e.currentTarget.value,
              });
            }}
          >
            {mailchimpLists?.map((list) => (
              <option value={list.id} key={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </Box>
      </Box>
      <Box marginTop={8} display="flex" justifyContent="flex-end">
        <Button
          disabled={savingStatus === "loading"}
          onClick={() => {
            mutateAsync(
              localState?.selected
                ? {
                    enabled: true,
                    listId: localState.listId,
                  }
                : {
                    enabled: false,
                  }
            ).then(() => {
              appBridge?.dispatch(
                actions.Notification({
                  status: "success",
                  title: "Success",
                  text: "Config saved",
                })
              );
            });
          }}
        >
          {savingStatus === "loading" ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Box>
  );
};
