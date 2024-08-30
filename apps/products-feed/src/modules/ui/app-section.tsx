import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";
import { ReactNode } from "react";

// todo move to shared
export const AppSection = ({
  heading,
  sideContent,
  mainContent,
  includePadding = false,
  ...props
}: PropsWithBox<{
  heading: string;
  sideContent?: ReactNode;
  mainContent: ReactNode;
  includePadding?: boolean;
}>) => {
  return (
    <Box as="section" __gridTemplateColumns={"400px auto"} display={"grid"} gap={10} {...props}>
      <Box>
        <Text as="h2" marginBottom={1.5} fontWeight="bold" size={6}>
          {heading}
        </Text>
        {sideContent}
      </Box>
      <Box
        borderStyle={"solid"}
        borderColor={"default1"}
        borderWidth={1}
        padding={includePadding ? 5 : 0}
        borderRadius={4}
      >
        {mainContent}
      </Box>
    </Box>
  );
};
