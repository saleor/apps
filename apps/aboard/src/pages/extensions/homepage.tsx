import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button, Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";

import styles from "./homepage.module.css";

const ABOARD_APP_IDENTIFIER = "saleor.aboard";

const HomepageWidget: NextPage = () => {
  const { appBridge, appBridgeState } = useAppBridge();

  const openImporter = () => {
    if (!appBridge) {
      return;
    }

    void appBridge.dispatch(
      actions.RedirectToApp({
        appIdentifier: ABOARD_APP_IDENTIFIER,
      }),
    );
  };

  return (
    <main className={styles.widget}>
      <div className={styles.copy}>
        <Text as="h1" size={7} fontWeight="bold">
          Bring your catalog with you
        </Text>
        <Text as="p" size={3} color="default2">
          Preview and import products from Google Merchant, WooCommerce, or a CSV file.
        </Text>
        <div className={styles.details} aria-label="Import benefits">
          <span className={styles.detail}>Preview before importing</span>
          <span className={styles.detail}>Existing imports are skipped</span>
        </div>
      </div>

      <Button type="button" disabled={!appBridgeState?.ready} onClick={openImporter}>
        Start import
      </Button>
    </main>
  );
};

export default HomepageWidget;
