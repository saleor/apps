import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { MainBar } from "./MainBar";
import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { AppIcon } from "./AppIcon";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
  indexActions: {
    marginTop: 10,
  },
});

export const SearchAppMainBar = () => {
  const { appBridge } = useAppBridge();
  const styles = useStyles();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      }),
    );
  };

  return (
    <MainBar
      icon={<AppIcon />}
      className={styles.topBar}
      name="Saleor Search"
      author="By Saleor Commerce"
      rightColumnContent={
        <div className={styles.buttonsGrid}>
          <Button
            variant="secondary"
            startIcon={<GitHub />}
            onClick={() => {
              openInNewTab("https://github.com/saleor/saleor-app-search");
            }}
          >
            Repository
          </Button>
          <Button
            startIcon={<OfflineBoltOutlined />}
            variant="secondary"
            onClick={() => {
              openInNewTab("https://github.com/saleor/apps/discussions");
            }}
          >
            Request a feature
          </Button>
        </div>
      }
    />
  );
};
