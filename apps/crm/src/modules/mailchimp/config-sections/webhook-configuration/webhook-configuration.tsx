import { Box, Button, Checkbox, Text } from "@saleor/macaw-ui";
import { trpcClient } from "../../../trpc/trpc-client";
import { ChangeEvent, ComponentProps, useEffect, useState } from "react";
import { Section } from "../../../ui/section/section";
import { useDashboardNotification } from "@saleor/apps-shared";
import { MailchimpListPicker } from "../../mailchimp-list-picker/mailchimp-list-picker";

type EnabledState = {
  selected: true;
  listId: string;
};

type DisabledState = {
  selected: false;
};

type InitialState = null;

type LocalState = EnabledState | DisabledState | InitialState;

const useRemoteData = () => {
  const remoteMailchimpConfig = trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();
  const remoteWebhookConfigMutation = trpcClient.mailchimp.config.setWebhookConfig.useMutation();
  const remoteMailchimpLists = trpcClient.mailchimp.audience.getLists.useQuery();

  return {
    mailchimpConfig: remoteMailchimpConfig,
    webhookConfigMutation: remoteWebhookConfigMutation,
    mailchimpLists: remoteMailchimpLists,
    allFetchedSuccess: remoteMailchimpLists.isSuccess && remoteMailchimpConfig.isSuccess,
    listsData: remoteMailchimpLists.data,
    mailchimpConfigData: remoteMailchimpConfig.data,
  };
};

export const WebhookConfiguration = (props: ComponentProps<typeof Box>) => {
  const { notifySuccess } = useDashboardNotification();

  const { allFetchedSuccess, listsData, mailchimpConfigData, webhookConfigMutation } =
    useRemoteData();

  const [localState, setLocalState] = useState<LocalState>(null);

  useEffect(() => {
    if (
      !(
        allFetchedSuccess &&
        mailchimpConfigData?.configured &&
        mailchimpConfigData?.customerCreateEvent
      )
    ) {
      // Something is wrong with configuration here, handle, throw or fallback
      return;
    }

    if (mailchimpConfigData.customerCreateEvent.enabled) {
      setLocalState({
        selected: true,
        listId: mailchimpConfigData.customerCreateEvent.listId,
      });
    } else {
      setLocalState({
        selected: false,
      });
    }
  }, [allFetchedSuccess, mailchimpConfigData?.configured, mailchimpConfigData]);

  if (!mailchimpConfigData?.configured || !localState || !listsData || !listsData.length) {
    return null;
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.checked
      ? setLocalState({
          selected: true,
          listId: listsData[0].id,
        })
      : setLocalState({
          selected: false,
        });
  };

  function handleSaveButton() {
    webhookConfigMutation
      .mutateAsync(
        localState?.selected
          ? {
              enabled: true,
              listId: localState.listId,
            }
          : {
              enabled: false,
            }
      )
      .then(() => {
        notifySuccess("Success", "Config Saved");
      });
  }

  return (
    <Section {...props}>
      <Text as="h1" variant="title" size="small" marginBottom={1.5}>
        Configure webhooks
      </Text>
      <Text color="textNeutralSubdued" as="p" marginBottom={5}>
        Each time customer is created, it will be added to selected audience list in Mailchimp
      </Text>
      <Box display="flex" gap={1.5} flexDirection="column">
        <Checkbox onChange={handleCheckboxChange} checked={localState.selected}>
          <Text marginRight="auto">Enable customers sync</Text>
        </Checkbox>
        <Box display="flex" alignItems="center">
          <Text
            color={localState?.selected ? "textNeutralDefault" : "textNeutralDisabled"}
            marginRight={1.5}
            variant="caption"
          >
            Sync to the Mailchimp list:
          </Text>

          <MailchimpListPicker
            disabled={!localState.selected}
            onChange={(_, value) => {
              if (localState?.selected) {
                setLocalState({
                  selected: true,
                  listId: value,
                });
              }
            }}
          />
        </Box>
      </Box>
      <Box marginTop={5} display="flex" justifyContent="flex-end">
        <Button disabled={webhookConfigMutation.status === "loading"} onClick={handleSaveButton}>
          {webhookConfigMutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Section>
  );
};
