import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";

export const MainInstructions = ({ children, ...props }: PropsWithBox<{}>) => {
  return (
    <Box {...props}>
      <Text as="p" marginBottom={1.5}>
        To configure the App, fill in your Typesense settings to enable products indexing.
      </Text>
      <Text as="p" marginBottom={1.5}>
        Once the App is configured, you will be able to perform initial index of your existing
        Saleor database.
      </Text>
    </Box>
  );
};
