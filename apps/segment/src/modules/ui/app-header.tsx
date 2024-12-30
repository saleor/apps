import { TextLink } from "@saleor/apps-ui";
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";

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
      <Text as="h1" marginBottom={4} size={10} fontWeight="bold">
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
