import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Text, ThemeProvider } from "@saleor/macaw-ui";
import { NextPageWithLayoutOverwrite } from "../../_app";
import { NoSSRWrapper } from "@saleor/apps-shared";

const MailchimpOauthSuccessPage: NextPageWithLayoutOverwrite = () => {
  const token = useRouter().query.token;
  const email = useRouter().query.email;
  const dc = useRouter().query.dc;

  useEffect(() => {
    if (token) {
      const payload = { type: "mailchimp_token", token, dc };

      window.parent.postMessage(payload, window.location.origin);
    }
  }, [token, dc]);

  return (
    <Box>
      <Text variant="title" as="h1" marginBottom={1.5}>
        Success
      </Text>
      <Text as="p" marginBottom={1.5}>
        Successfully authorized Mailchimp as {email}
      </Text>
      <Text>Will redirect soon...</Text>
    </Box>
  );
};

MailchimpOauthSuccessPage.overwriteLayout = (page) => (
  <NoSSRWrapper>
    <ThemeProvider>{page}</ThemeProvider>
  </NoSSRWrapper>
);

export default MailchimpOauthSuccessPage;
