import { trpcClient } from "../../../trpc/trpc-client";
import { Box, Text } from "@saleor/macaw-ui/next";
import { RemoveMailchimpConfig } from "../../remove-mailchimp-config/remove-mailchimp-config";
import { MailchimpAuthorizeView } from "../mailchimp-authorize-view/mailchimp-authorize-view";
import { MailchimpLists } from "../../config-sections/mailchimp-lists/mailchimp-lists";
import { CustomerCreateEventSettings } from "../../customer-create-event-settings/customer-create-event-settings";
import { SaleorCustomersList } from "../../../saleor-customers/saleor-customers-list";
import { ConnectionStatus } from "../../config-sections/connection-status/connection-status";

const header = (
  <Box marginBottom={12}>
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
        <Text>{error.message}</Text>
      </div>
    );
  }

  if (isMailchimpConfigured && isFetched) {
    return (
      <div>
        {header}
        <Box marginBottom={12} display="flex" justifyContent="space-between" gap={12}>
          <ConnectionStatus __flex="0 1 50%" />
          <MailchimpLists __flex="0 1 50%" />
        </Box>

        <CustomerCreateEventSettings marginBottom={12} />
        <SaleorCustomersList marginBottom={12} />
        <RemoveMailchimpConfig />
      </div>
    );
  } else {
    return (
      <Box>
        {header}
        <MailchimpAuthorizeView
          onSuccess={() => {
            refetch();
          }}
        />
      </Box>
    );
  }

  return null;
};
