import { Box, Text, Button, WarningIcon } from "@saleor/macaw-ui/next";
import { ComponentProps } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { trpcClient } from "../../../trpc/trpc-client";
import { DangerSection } from "../../../ui/danger-section/danger-section";
import { TextLink } from "../../../ui/text-link/text-link";

export const RemoveMailchimpConfig = (props: ComponentProps<typeof Box>) => {
  const { appBridge } = useAppBridge();
  const { mutateAsync } = trpcClient.mailchimp.config.removeToken.useMutation();
  const { refetch } = trpcClient.mailchimp.config.getMailchimpConfigured.useQuery();

  return (
    <DangerSection>
      <Text color="textCriticalDefault" variant="title" size="small">
        Remove configuration
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text as="p" marginY={8}>
        This operation will remove saved Mailchimp token from App database. You will be able to
        connect it again. <br />
        It will not disconnect CRM App in Mailchimp - you can do it in the{" "}
        <TextLink href="https://us21.admin.mailchimp.com/account/connected-sites/app-selection/">
          Mailchimp Dashboard
        </TextLink>
      </Text>
      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => mutateAsync().then(() => refetch())}
          variant="secondary"
          // @ts-ignore todo macaw
          borderColor="criticalDefault"
          color="textCriticalDefault"
        >
          Disconnect Mailchimp
        </Button>
      </Box>
    </DangerSection>
  );
};
