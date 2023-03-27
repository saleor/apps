import { trpcClient } from "../../../trpc/trpc-client";
import { Box, Text } from "@saleor/macaw-ui/next";
import { RemoveMailchimpConfig } from "../../remove-mailchimp-config/remove-mailchimp-config";
import { MailchimpAuthFrame } from "../../mailchimp-auth-frame/mailchimp-auth-frame";

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

  if (isMailchimpConfigured && isFetched) {
    return (
      <div>
        {header}
        <Text>All set</Text>
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
        <MailchimpAuthFrame __height="800px" />
      </Box>
    );
  }

  return null;
};
