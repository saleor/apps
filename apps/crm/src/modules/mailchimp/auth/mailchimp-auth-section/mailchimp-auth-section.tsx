import { LoginWithMailchimpButton } from "../../../ui/login-with-mailchimp-button/login-with-mailchimp-button";
import React from "react";
import { Text } from "@saleor/macaw-ui";
import { Section } from "../../../ui/section/section";
import { useAppBridgePersistence } from "../../../../lib/app-bridge-persistence";

export const MailchimpAuthSection = () => {
  const appBridgeContext = useAppBridgePersistence();

  if (!appBridgeContext) {
    throw new Error("Iframe can only work if AppBridge state was previously set in SessionStorage");
  }

  return (
    <Section display="flex" flexDirection="column">
      <Text as="p" marginBottom={5}>
        You need to connect Mailchimp with Saleor CRM App. Click button below and authorize the App.
      </Text>
      <form method="POST" action="/api/auth/mailchimp/oauth">
        <input hidden readOnly name="token" value={appBridgeContext.token} />
        <input hidden readOnly name="saleorApiUrl" value={appBridgeContext.saleorApiUrl} />
        <LoginWithMailchimpButton type="submit" />
      </form>
    </Section>
  );
};
