import { NextPage } from "next";
import React from "react";
import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { Nav } from "../modules/ui/nav/nax";
import { Layout } from "../modules/ui/layout/layout";
import { MailchimpLists } from "../modules/mailchimp/mailchimp-lists/mailchimp-lists";
import { trpcClient } from "../modules/trpc/trpc-client";

const SettingsPage: NextPage = () => {
  const { data, mutateAsync } = trpcClient.mailchimp.audience.addContact.useMutation();

  return (
    <Layout>
      <Box>
        <Nav />
      </Box>
      <div>
        <Text variant="title">Mailchimp settings</Text>
        <MailchimpLists marginTop={8} />
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);

              mutateAsync({
                listId: data.get("listId") as string,
                contact: {
                  email: data.get("email") as string,
                },
              }).then(console.log);
            }}
          >
            <input type="listId" name="listId" />
            <input type="email" name="email" />
            <Button>Add client</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
