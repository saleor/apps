import { NextPage } from "next";
import React from "react";

import { List, ListItem, ListItemCell } from "@saleor/macaw-ui";
import { LoginWithMailchimpButton } from "../../modules/ui/login-with-mailchimp-button/login-with-mailchimp-button";
import { RootTabs } from "../../modules/ui/root-tabs/root-tabs";
import { AppColumnsLayout } from "../../modules/ui/app-columns-layout";

const IndexPage: NextPage = () => {
  return (
    <div>
      <RootTabs />
      <AppColumnsLayout>
        <List gridTemplate={["1fr"]}>
          <ListItem>
            <ListItemCell>Mailchimp</ListItemCell>
          </ListItem>
        </List>
        <div>
          <a href={`/api/auth/mailchimp`}>
            <LoginWithMailchimpButton />
          </a>
        </div>
      </AppColumnsLayout>
    </div>
  );
};

export default IndexPage;
