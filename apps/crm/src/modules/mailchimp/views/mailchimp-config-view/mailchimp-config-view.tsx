import { trpcClient } from "../../../trpc/trpc-client";

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
    return <div>All set</div>;
  }

  return <div>config</div>;
};
