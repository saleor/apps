import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text } from "@saleor/macaw-ui/next";

interface FeedPreviewCardProps {
  channelSlug: string;
}

export const FeedPreviewCard = ({ channelSlug }: FeedPreviewCardProps) => {
  const { appBridge } = useAppBridge();
  const { saleorApiUrl } = appBridge?.getState() || {};

  const googleFeedUrl = `${window.location.origin}/api/feed/${encodeURIComponent(
    saleorApiUrl as string
  )}/${channelSlug}/google.xml`;

  const openUrlInNewTab = async (url: string) => {
    await appBridge?.dispatch(actions.Redirect({ to: url, newContext: true }));
  };

  return (
    <Box>
      <Text>Your Google Merchant Feed preview</Text>
      <Input
        label="Google feed URL"
        value={googleFeedUrl}
        disabled={true}
        helperText="Dedicated URL for your Google Merchant Feed"
      />

      <Button type="submit" variant="secondary" onClick={() => openUrlInNewTab(googleFeedUrl)}>
        Open feed in a new tab
      </Button>
    </Box>
  );
};
