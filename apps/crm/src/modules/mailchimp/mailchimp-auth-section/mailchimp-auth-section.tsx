import { LoginWithMailchimpButton } from "../../ui/login-with-mailchimp-button/login-with-mailchimp-button";
import React from "react";
import Link from "next/link";
import { Box, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../ui/section/section";

export const MailchimpAuthSection = () => {
  return (
    <Section display="flex" flexDirection="column">
      {/* @ts-ignore todo macaw */}
      <Text as="p" marginBottom={8}>
        You need to connect Mailchimp with Saleor CRM App. Click button below and authorize the App.
      </Text>
      <Link href="/api/auth/mailchimp">
        <LoginWithMailchimpButton />
      </Link>
    </Section>
  );
};
