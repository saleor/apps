import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, PropsWithBox, Text } from "@saleor/macaw-ui";

import { useGetFeedApiUrl } from "../feed-url/use-get-feed-api-url";

interface FeedPreviewCardProps {
  channelSlug: string;
}

export const FeedPreviewCard = ({ channelSlug, ...props }: PropsWithBox<FeedPreviewCardProps>) => {
  const { appBridge } = useAppBridge();

  const googleFeedUrl = useGetFeedApiUrl(channelSlug);

  if (!googleFeedUrl) {
    // Should never happen
    return null;
  }

  const openUrlInNewTab = async (url: string) => {
    await appBridge?.dispatch(actions.Redirect({ to: url, newContext: true }));
  };

  return (
    <Box {...props}>
      <Text size={5} fontWeight="bold" as={"h2"} marginBottom={1.5}>
        Test your feed
      </Text>
      <Input
        label="Google feed URL"
        value={googleFeedUrl}
        onFocus={(e) => {
          e.target.select();
        }}
        helperText="Dedicated URL for your Google Merchant Feed. Click to select and copy."
      />

      <Box display={"flex"} justifyContent={"flex-end"}>
        <Button variant="secondary" onClick={() => openUrlInNewTab(googleFeedUrl)} marginTop={3}>
          Open feed in a new tab
        </Button>
      </Box>
    </Box>
  );
};
