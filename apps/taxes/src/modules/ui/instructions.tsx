import { Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { AppLink } from "./app-link";
import { AppPaper } from "./app-paper";
import { AppTabNavButton } from "./app-tab-nav-button";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  list: {
    paddingLeft: "16px",
    margin: 0,
    color: "inherit",
  },
}));

export const Instructions = () => {
  const styles = useStyles();

  return (
    <AppPaper>
      <div className={styles.root}>
        <Typography variant="h4">Use external service for tax calculation</Typography>
        <Typography variant="body1">
          <ol className={styles.list}>
            <li>
              Go to <AppLink href="/taxes/channels">Tax Configuration</AppLink>. Make sure you chose{" "}
              <q>Use tax app</q> as the method of tax calculation for your channel.
            </li>
            <li>
              In the Tax App, go to the <AppTabNavButton to="providers">Providers</AppTabNavButton>{" "}
              tab to add an instance of your provider. Click <q>Add provider</q>, and select the tax
              provider you want to use. Fill in the configuration form and hit <q>Save</q>.
            </li>
            <li>
              Go to the <AppTabNavButton to="channels">Channels</AppTabNavButton> tab. Select a
              channel. In the <q>Channel tax provider</q> field, select the created instance. Fill
              in the rest of the form, and hit <q>Save</q>.
            </li>
            <li>
              Saleor will now use the channel&#39;s configured tax provider for order & checkout tax
              calculations.
            </li>
          </ol>
        </Typography>
      </div>
    </AppPaper>
  );
};
