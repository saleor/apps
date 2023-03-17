import { NextPage } from "next";
import React from "react";

import { List, ListItem, ListItemCell } from "@saleor/macaw-ui";
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
          <iframe
            src="/configuration/mailchimp/auth"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </AppColumnsLayout>
    </div>
  );
};

export default IndexPage;
