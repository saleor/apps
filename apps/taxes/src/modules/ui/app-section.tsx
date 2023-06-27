import { Box, PropsWithBox, Text } from "@saleor/macaw-ui/next";
import React from "react";

const MAX_WIDTH = "480px";

const Header = ({ children, ...props }: PropsWithBox<{ children: React.ReactNode }>) => {
  return (
    <Box __maxWidth={MAX_WIDTH} {...props}>
      <Text as="p" variant="body">
        {children}
      </Text>
    </Box>
  );
};

const Description = ({
  title,
  description,
  ...props
}: PropsWithBox<{
  title: React.ReactNode;
  description: React.ReactNode;
}>) => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10} __maxWidth={MAX_WIDTH} {...props}>
      <Text as="h3" variant="heading">
        {title}
      </Text>
      <Text as="p" variant="body">
        {description}
      </Text>
    </Box>
  );
};

export const Section = {
  Header,
  Description,
};
