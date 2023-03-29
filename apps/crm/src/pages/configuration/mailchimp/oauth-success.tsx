import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Text } from "@saleor/macaw-ui/next";

const ConfigurationPage: NextPage = () => {
  const token = useRouter().query.token;
  const email = useRouter().query.email;
  const dc = useRouter().query.dc;

  useEffect(() => {
    if (token) {
      const payload = { type: "mailchimp_token", token, dc };

      window.parent.postMessage(JSON.stringify(payload), window.location.origin); // todo restrict origin
    }
  }, [token, dc]);

  return (
    <Box>
      {/* @ts-ignore todo macaw*/}
      <Text variant="title" as="h1" marginBottom={4}>
        Success
      </Text>
      <Text>Successfully authorized Mailchimp as {email}</Text>
    </Box>
  );
};

export default ConfigurationPage;
