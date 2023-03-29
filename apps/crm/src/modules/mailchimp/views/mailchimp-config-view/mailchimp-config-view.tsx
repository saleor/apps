import { trpcClient } from "../../../trpc/trpc-client";
import { Box, Text } from "@saleor/macaw-ui/next";
import { RemoveMailchimpConfig } from "../../remove-mailchimp-config/remove-mailchimp-config";
import { MailchimpAuthorizeView } from "../mailchimp-authorize-view/mailchimp-authorize-view";
import { MailchimpLists } from "../../mailchimp-lists/mailchimp-lists";
import { CustomerCreateEventSettings } from "../../customer-create-event-settings/customer-create-event-settings";
import { SaleorCustomersList } from "../../../saleor-customers/saleor-customers-list";

const header = (
  <Text
    as="h1"
    borderBottomStyle="solid"
    borderColor="neutralHighlight"
    borderBottomWidth={1}
    variant="title"
    marginBottom={8}
  >
    Mailchimp
  </Text>
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
        <Box marginBottom={12} display="flex" justifyContent="space-between">
          <Box>
            <Text variant="heading" as="p" marginBottom={2}>
              Connection status
            </Text>
            <Text>All good</Text>
          </Box>
          <MailchimpLists marginBottom={12} __flex="0 0 50%" />
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
        <Text as="p" marginBottom={8}>
          You need to connect Mailchimp with Saleor CRM App. Click button below and authorize the
          App.
        </Text>
        <MailchimpAuthorizeView />
      </Box>
    );
  }

  return null;
};
