import { Paper, TextField, Typography } from "@material-ui/core";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button, makeStyles } from "@saleor/macaw-ui";

const useStyles = makeStyles((theme) => {
  return {
    header: { marginBottom: 20 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: 40 },
    formContainer: {
      top: 0,
      position: "sticky",
    },
    instructionsContainer: {
      padding: 15,
    },
    field: {
      marginBottom: 20,
    },
  };
});

interface FeedPreviewCardProps {
  channelSlug: string;
}

export const FeedPreviewCard = ({ channelSlug }: FeedPreviewCardProps) => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();
  const { saleorApiUrl } = appBridge?.getState() || {};

  const googleFeedUrl = `${window.location.origin}/api/feed/${encodeURIComponent(
    saleorApiUrl as string
  )}/${channelSlug}/google.xml`;

  const openUrlInNewTab = async (url: string) => {
    await appBridge?.dispatch(actions.Redirect({ to: url, newContext: true }));
  };

  return (
    <Paper elevation={0} className={styles.instructionsContainer}>
      <Typography paragraph variant="h3">
        Your Google Merchant Feed preview
      </Typography>
      <TextField
        label="Google feed URL"
        fullWidth
        value={googleFeedUrl}
        disabled={true}
        className={styles.field}
        helperText="Dedicated URL for your Google Merchant Feed"
      />

      <Button
        type="submit"
        variant="secondary"
        fullWidth
        onClick={() => openUrlInNewTab(googleFeedUrl)}
      >
        Open feed in a new tab
      </Button>
    </Paper>
  );
};
