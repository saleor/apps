import { TextLink } from "@saleor/apps-ui";
import { Box, BoxProps, Text } from "@saleor/macaw-ui";

export const AppHeader = ({ ...props }: BoxProps) => {
  return (
    <Box marginBottom={20} paddingBottom={6} {...props}>
      <Text as="h1" marginBottom={4} size={10} fontWeight="bold">
        Configuration
      </Text>
      <Text>
        Configure your Stripe App. Read the{" "}
        <TextLink href="https://docs.saleor.io/docs/3.x/developer/app-store/apps/stripe" newTab>
          docs
        </TextLink>{" "}
        to learn more
      </Text>
    </Box>
  );
};
