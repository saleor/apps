import { Box, Button, Text } from "@saleor/macaw-ui";
import { ComponentProps } from "react";
import { trpcClient } from "../../../trpc/trpc-client";
import { DangerSection } from "../../../ui/danger-section/danger-section";
import { TextLink } from "@saleor/apps-ui";

export const RemoveMailchimpConfig = (props: ComponentProps<typeof Box>) => {
  const { mutateAsync, isLoading, isSuccess } =
    trpcClient.mailchimp.config.removeToken.useMutation();
  const { refetch, data } = trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();

  if (!data || !data.configured) {
    return null;
  }

  return (
    <DangerSection>
      <Text color="textCriticalDefault" variant="title" size="small">
        Remove configuration
      </Text>
      <Text as="p" marginY={5}>
        This operation will remove saved Mailchimp token from App database. You will be able to
        connect it again. <br />
        It will not disconnect CRM App in Mailchimp - you can do it in the{" "}
        <TextLink
          href={`https://${data.dc}.admin.mailchimp.com/account/connected-sites/app-selection/`}
        >
          Mailchimp Dashboard
        </TextLink>
      </Text>
      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => mutateAsync().then(() => refetch())}
          variant="secondary"
          borderColor="criticalDefault"
          color="textCriticalDefault"
          disabled={isLoading ?? isSuccess}
        >
          {isLoading ?? isSuccess ? "Disconnecting..." : "Disconnect Mailchimp"}
        </Button>
      </Box>
    </DangerSection>
  );
};
