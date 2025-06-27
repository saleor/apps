import { Box, Button, PropsWithBox, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

interface FeedPreviewCardProps {
  channelSlug: string;
}

export const FeedPreviewCard = ({ channelSlug, ...props }: PropsWithBox<FeedPreviewCardProps>) => {
  const router = useRouter();

  return (
    <Box {...props}>
      <Text size={5} fontWeight="bold" as={"h2"} marginBottom={1.5}>
        Create initial feed
      </Text>
      <Text as="p" marginBottom={4}>
        First feed generation must be processed manually, by clicking the button below. Further
        updates will be triggered every 3h in the background for products that have been modified.
      </Text>
      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => {
            router.push("/generate-initial-feed?channelSlug=" + channelSlug);
          }}
        >
          Create feed for {channelSlug}
        </Button>
      </Box>
    </Box>
  );
};
