import { TextLink } from "@saleor/apps-ui";
import { Box, BoxProps, Text } from "@saleor/macaw-ui";

export const AppHeader = ({ ...props }: BoxProps) => {
  return (
    <Box marginBottom={20} paddingBottom={6} {...props}>
      <Text as="h1" marginBottom={4} size={10} fontWeight="bold">
        Configuration
      </Text>
      <Text>
        Configure the app by connecting to Stripe. Read the{" "}
        <TextLink href="https://docs.saleor.io/developer/app-store/apps/stripe/overview" newTab>
          documentation
        </TextLink>{" "}
        to learn more.
      </Text>
      <Box>{props.children}</Box>
    </Box>
  );
};
