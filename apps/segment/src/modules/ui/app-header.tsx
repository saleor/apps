import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";

import { TextLink } from "@/components/TextLink";

type Props = PropsWithBox<{}>;

export const AppHeader = ({ ...props }: Props) => {
  return (
    <Box
      marginBottom={14}
      borderBottomWidth={1}
      borderBottomStyle="solid"
      borderColor="default1"
      paddingBottom={6}
      {...props}
    >
      <Text as="h1" marginBottom={4} size={2}>
        Configuration
      </Text>
      <Text>
        Read the{" "}
        <TextLink href="https://docs.saleor.io/docs/3.x/developer/app-store/apps/segment" newTab>
          docs
        </TextLink>{" "}
        to learn more
      </Text>
    </Box>
  );
};
