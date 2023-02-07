import { NextPage } from "next";
import React, { ComponentProps } from "react";
import { Container, Divider, Typography } from "@material-ui/core";
import { Button, makeStyles, PageTab, PageTabs, SaleorTheme } from "@saleor/macaw-ui";
import { CustomersImporterView } from "../modules/customers/customers-importer-nuvo/customers-importer-view";
import GraphQLProvider from "../providers/GraphQLProvider";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { MainBar } from "../modules/ui/main-bar";
import { AppIcon } from "../modules/ui/app-icon";

type Tab = "customers";

const useStyles = makeStyles((theme: SaleorTheme) => ({
  wrapper: {
    border: `1px solid ${theme.palette.divider}`,
    minHeight: `calc(100vh - 100px)`,
  },
}));

const ImporterPage: NextPage = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>("customers");
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      })
    );
  };

  return (
    <div className={styles.wrapper}>
      <MainBar
        bottomMargin
        icon={<AppIcon />}
        name="Data Importer"
        author="By Saleor Commerce"
        rightColumnContent={
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              onClick={() => {
                openInNewTab("https://github.com/saleor/saleor-app-data-importer");
              }}
              variant="tertiary"
            >
              Repository
            </Button>
            <Button
              onClick={() => {
                openInNewTab("https://github.com/saleor/apps/discussions");
              }}
              variant="tertiary"
            >
              Request a feature
            </Button>
          </div>
        }
      />
      <Container>
        <PageTabs
          style={{ marginBottom: 20, marginTop: 20 }}
          value={activeTab}
          onChange={(e) => setActiveTab(e as Tab)}
        >
          <PageTab value="customers" label="Customers" />
          <PageTab disabled value="orders" label="Orders (coming soon)" />
          <PageTab disabled value="products" label="Products (coming soon)" />
        </PageTabs>
        <Divider style={{ marginBottom: 50 }} />
        {activeTab === "customers" && <CustomersImporterView />}
      </Container>
    </div>
  );
};

const WrappedPage = (props: ComponentProps<NextPage>) => (
  <GraphQLProvider>
    <ImporterPage {...props} />
  </GraphQLProvider>
);

export default WrappedPage;
