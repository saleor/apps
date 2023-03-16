import { PageTab, PageTabs } from "@saleor/macaw-ui";
import React from "react";

export const RootTabs = () => {
  return (
    <PageTabs
      value="providers"
      onChange={(value) => {
        // todo
      }}
    >
      <PageTab value="providers" label="Providers" />
      <PageTab value="customers-sync" label="Sync Customers" />
    </PageTabs>
  );
};
