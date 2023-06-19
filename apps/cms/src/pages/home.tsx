import { AppTabs } from "../modules/ui/app-tabs";
import { AppLayout } from "../modules/ui/app-layout";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

import { AppTabNavButton } from "../modules/ui/app-tab-nav-button";
import { makeStyles } from "@saleor/macaw-ui";
import { Box, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  section: {
    border: `1px solid hsla(330, 5%, 91%, 1)`, // todo macaw
    padding: 20,
    borderRadius: 8,
  },
  dataModelList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    "& li": {
      margin: "1em 0",
    },
  },
});

const HomePage: NextPageWithLayout = () => {
  const styles = useStyles();

  return (
    <>
      <AppTabs activeTab="home" />
      <div>
        <Box>
          <Typography variant="h3">Connect CMS</Typography>
          <p>
            Visit <AppTabNavButton to="providers">providers settings</AppTabNavButton> to configure
            one of existing providers. Then, connect provider to each{" "}
            <AppTabNavButton to="channels">channel</AppTabNavButton>.
          </p>
        </Box>
        <div className={styles.section}>
          <Typography variant="h4">CMS Data Model setup</Typography>
          <p>CMS App requires your CMS data model to be configured with following structure:</p>
          <ul className={styles.dataModelList}>
            <li>
              <code>saleor_id</code> - string (Variant ID in Saleor)
            </li>
            <li>
              <code>name</code> - string (Variant name in Saleor)
            </li>
            <li>
              <code>product_id</code> - string (Product ID in Saleor)
            </li>
            <li>
              <code>product_name</code> - string (Product name in Saleor)
            </li>
            <li>
              <code>product_slug</code> - string (Product slug in Saleor)
            </li>
            <li>
              <code>channels</code> - JSON (list of channels product belongs to)
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

HomePage.getLayout = function getLayout(page: ReactElement) {
  return (
    <main>
      <AppLayout>{page}</AppLayout>
    </main>
  );
};

export default HomePage;
