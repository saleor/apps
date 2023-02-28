import { makeStyles, Button } from "@saleor/macaw-ui";
import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { MainBar } from "./main-bar";
import Image from "next/image";
import appIcon from "../../assets/app-icon.svg";
import { APP_REPO_URL, SALEOR_APPS_DISCUSSIONS_URL } from "../../constants";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
  appIconContainer: {
    background: "#52C1FF",
    padding: 10,
    borderRadius: "50%",
    width: 50,
    height: 50,
  },
});

const AppIcon = () => {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <Image width={30} height={30} alt="icon" src={appIcon} />
    </div>
  );
};

export const AppMainBar = () => {
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
    <MainBar
      icon={<AppIcon />}
      className={styles.topBar}
      name="Taxes"
      author="By Saleor Commerce"
      rightColumnContent={
        <div className={styles.buttonsGrid}>
          <Button
            variant="secondary"
            startIcon={<GitHub />}
            onClick={() => {
              openInNewTab(APP_REPO_URL);
            }}
          >
            Repository
          </Button>
          <Button
            startIcon={<OfflineBoltOutlined />}
            variant="secondary"
            onClick={() => {
              openInNewTab(SALEOR_APPS_DISCUSSIONS_URL);
            }}
          >
            Request a feature
          </Button>
        </div>
      }
    />
  );
};
