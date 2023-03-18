import { NextPage } from "next";
import React from "react";
import { Box, Text } from "@saleor/macaw-ui/next";
import { Nav } from "../modules/ui/nav/nax";
import { Layout } from "../modules/ui/layout/layout";

const SettingsPage: NextPage = () => {
  return (
    <Layout>
      <Nav />
      <div>
        <Text variant="heading">Mailchimp settings</Text>
      </div>
    </Layout>
  );
};

export default SettingsPage;
