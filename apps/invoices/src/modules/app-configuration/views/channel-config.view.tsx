import { Box, ChevronRightIcon, Text, Button } from "@saleor/macaw-ui/next";
import { AppSection } from "../../ui/AppSection";
import { useRouter } from "next/router";
import { AddressForm } from "../ui/address-form";

export const ChannelConfigView = () => {
  const {
    query: { channel },
  } = useRouter();

  if (!channel) {
    return null;
  }

  return (
    <Box>
      <Box __marginBottom={"100px"}>
        <Box marginBottom={8} display={"flex"} alignItems={"center"}>
          <Text color={"textNeutralSubdued"}>Configuration</Text>
          <ChevronRightIcon color={"textNeutralSubdued"} />
          <Text color={"textNeutralSubdued"}>Edit channel</Text>
          <ChevronRightIcon color={"textNeutralSubdued"} />
          <Text>{channel}</Text>
        </Box>
      </Box>
      <AppSection
        includePadding={true}
        heading={"Shop address per channel"}
        mainContent={<AddressForm channelSlug={channel as string} />}
        sideContent={
          <Box>
            <Text marginBottom={8} as={"p"}>
              Set custom billing address for <Text variant={"bodyStrong"}>{channel}</Text> channel.
            </Text>
            <Button
              variant={"secondary"}
              onClick={() => {
                throw new Error("not implemented");
              }}
            >
              Remove and set to default
            </Button>
          </Box>
        }
      />
    </Box>
  );
};
