import { trpcClient } from "../../../trpc/trpc-client";
import { Text } from "@saleor/macaw-ui/next";
import { RemoveMailchimpConfig } from "../../remove-mailchimp-config/remove-mailchimp-config";

export const MailchimpConfigView = () => {
  const {
    data: mailchimpConfigured,
    refetch,
    isFetched,
    isLoading,
  } = trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();

  const isMailchimpConfigured = mailchimpConfigured?.configured;

  if (isLoading) {
    return <div>Checking Mailchimp config status...</div>;
  }

  if (isMailchimpConfigured) {
    return (
      <div>
        <Text>All set</Text>
        <RemoveMailchimpConfig />
      </div>
    );
  }

  return null;
};
