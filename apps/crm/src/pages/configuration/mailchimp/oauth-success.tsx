import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Text } from "@saleor/macaw-ui/next";

const MailchimpOauthSuccessPage: NextPage = () => {
  const token = useRouter().query.token;
  const email = useRouter().query.email;
  const dc = useRouter().query.dc;

  useEffect(() => {
    if (token) {
      const payload = { type: "mailchimp_token", token, dc };

      window.parent.postMessage(JSON.stringify(payload), window.location.origin);
    }
  }, [token, dc]);

  return (
    <Box>
      {/* @ts-ignore todo macaw*/}
      <Text variant="title" as="h1" marginBottom={4}>
        Success
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text as="p" marginBottom={4}>
        Successfully authorized Mailchimp as {email}
      </Text>
      <Text>Will redirect soon...</Text>
    </Box>
  );
};

export default MailchimpOauthSuccessPage;
