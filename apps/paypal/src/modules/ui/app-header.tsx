import { TextLink } from "@saleor/apps-ui";
import { Box, BoxProps, Text } from "@saleor/macaw-ui";

export const AppHeader = ({ ...props }: BoxProps) => {
  return (
    <Box
      marginBottom={12}
      paddingBottom={8}
      borderBottomWidth={1}
      borderColor="default1"
      {...props}
    >
      <Text as="h1" marginBottom={3} size={10} fontWeight="bold" __color="#1a1a1a">
        PayPal Payment Configuration
      </Text>
      <Text size={3} color="default2">
        Configure your PayPal integration to start accepting payments. Read the{" "}
        <TextLink href="https://docs.saleor.io/developer/app-store/apps/paypal/overview" newTab>
          documentation
        </TextLink>{" "}
        to learn more about setup and features.
      </Text>
      <Box>{props.children}</Box>
    </Box>
  );
};
