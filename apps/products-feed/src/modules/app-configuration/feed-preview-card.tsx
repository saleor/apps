import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text, PropsWithBox } from "@saleor/macaw-ui/next";
import { useDashboardNotification } from "@saleor/apps-shared";

interface FeedPreviewCardProps {
  channelSlug: string;
}

export const FeedPreviewCard = ({ channelSlug, ...props }: PropsWithBox<FeedPreviewCardProps>) => {
  const { appBridge, appBridgeState } = useAppBridge();
  const { notifyError, notifySuccess } = useDashboardNotification();

  if (!appBridgeState) {
    return null;
  }

  // todo extract and test
  const googleFeedUrl = `${window.location.origin}/api/feed/${encodeURIComponent(
    appBridgeState.saleorApiUrl as string
  )}/${channelSlug}/google.xml`;

  const openUrlInNewTab = async (url: string) => {
    await appBridge?.dispatch(actions.Redirect({ to: url, newContext: true }));
  };

  return (
    <Box {...props}>
      <Input
        label="Google feed URL"
        value={googleFeedUrl}
        onFocus={(e) => {
          e.target.select();
        }}
        helperText="Dedicated URL for your Google Merchant Feed. Click to select and copy."
      />

      <Button variant="secondary" onClick={() => openUrlInNewTab(googleFeedUrl)} marginTop={6}>
        Open feed in a new tab
      </Button>
    </Box>
  );
};
