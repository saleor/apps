import { LoginWithMailchimpButton } from "../../../ui/login-with-mailchimp-button/login-with-mailchimp-button";
import React, { useRef, useState } from "react";
import { Box, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../../ui/section/section";
import { AppBridgePersistence } from "../../../../lib/app-bridge-persistence";

export const MailchimpAuthSection = () => {
  const appBridgeContext = useRef(AppBridgePersistence.get());

  if (!appBridgeContext.current) {
    throw new Error("Iframe can only work if AppBridge state was previously set in SessionStorage");
  }

  return (
    <Section display="flex" flexDirection="column">
      <Text as="p" marginBottom={8}>
        You need to connect Mailchimp with Saleor CRM App. Click button below and authorize the App.
      </Text>
      <form method="POST" action="/api/auth/mailchimp">
        <input hidden readOnly name="token" value={appBridgeContext.current!.token} />
        <input hidden readOnly name="saleorApiUrl" value={appBridgeContext.current!.saleorApiUrl} />
        <LoginWithMailchimpButton type="submit" />
      </form>
    </Section>
  );
};
