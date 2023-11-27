import { trpcClient } from "../../../trpc/trpc-client";
import { Box, Text } from "@saleor/macaw-ui";
import { RemoveMailchimpConfig } from "../../config-sections/remove-mailchimp-config/remove-mailchimp-config";
import { MailchimpAuthorizeView } from "../mailchimp-authorize-view/mailchimp-authorize-view";
import { MailchimpLists } from "../../config-sections/mailchimp-lists/mailchimp-lists";
import { WebhookConfiguration } from "../../config-sections/webhook-configuration/webhook-configuration";
import { SaleorCustomersSync } from "../../../saleor-customers-sync/saleor-customers-sync";
import { ConnectionStatus } from "../../config-sections/connection-status/connection-status";
import { Instructions } from "../../config-sections/instructions/instructions";

const header = (
  <Box marginBottom={9}>
    <Text as="h1" variant="title" size="large">
      Mailchimp
    </Text>
  </Box>
);

export const MailchimpConfigView = () => {
  const {
    data: mailchimpConfigured,
    refetch,
    isFetched,
    isLoading,
    error,
  } = trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();

  const isMailchimpConfigured = mailchimpConfigured?.configured;

  if (isLoading) {
    return (
      <div>
        {header}
        <Text>Checking Mailchimp config status...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {header}
        <Box marginBottom={9} display="flex" justifyContent="space-between" gap={9}>
          <ConnectionStatus status="error" __flex="0 1 50%" />
        </Box>
      </div>
    );
  }

  if (isMailchimpConfigured && isFetched) {
    return (
      <div>
        {header}
        <Instructions marginBottom={9} />
        <Box marginBottom={9} display="flex" justifyContent="space-between" gap={9}>
          <ConnectionStatus status="ok" __flex="0 1 50%" />
          <MailchimpLists __flex="0 1 50%" />
        </Box>

        <WebhookConfiguration marginBottom={9} />
        <SaleorCustomersSync marginBottom={9} />
        <RemoveMailchimpConfig />
      </div>
    );
  } else {
    return (
      <Box>
        {header}
        <MailchimpAuthorizeView onSuccess={refetch} />
      </Box>
    );
  }

  return null;
};
