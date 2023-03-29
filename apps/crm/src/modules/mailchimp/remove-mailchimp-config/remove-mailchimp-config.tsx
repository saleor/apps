import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { ComponentProps } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { trpcClient } from "../../trpc/trpc-client";

export const RemoveMailchimpConfig = (props: ComponentProps<typeof Box>) => {
  const { appBridge } = useAppBridge();
  const { mutate } = trpcClient.mailchimp.config.removeToken.useMutation();

  return (
    <Box backgroundColor="surfaceCriticalSubdued" {...props} padding={8} borderRadius={4}>
      <Text color="textCriticalDefault" variant="title" size="small">
        Remove configuration
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text as="p" marginY={8}>
        This operation will remove saved Mailchimp token from App database. You will be able to
        connect it again. <br />
        It will not disconnect CRM App in Mailchimp - you can do it in{" "}
        <a
          href="https://us21.admin.mailchimp.com/account/connected-sites/app-selection/"
          onClick={(e) => {
            e.preventDefault();

            appBridge?.dispatch(
              actions.Redirect({
                // todo - fetch DC and replace us21
                to: "https://us21.admin.mailchimp.com/account/connected-sites/app-selection/",
                newContext: true,
              })
            );
          }}
        >
          Mailchimp Dashboard
        </a>
      </Text>
      <Button onClick={() => mutate()} variant="secondary">
        Disconnect Mailchimp.
      </Button>
    </Box>
  );
};
