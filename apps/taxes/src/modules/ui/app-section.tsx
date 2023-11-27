import { Box, PropsWithBox, Text } from "@saleor/macaw-ui";
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
  title?: React.ReactNode;
  description?: React.ReactNode;
}>) => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10} __maxWidth={MAX_WIDTH} {...props}>
      {title && (
        <Text as="h3" variant="heading">
          {title}
        </Text>
      )}
      {description && (
        <Box fontWeight={"bodyMedium"} fontSize={"bodyMedium"}>
          {description}
        </Box>
      )}
    </Box>
  );
};

export const Section = {
  Header,
  Description,
};
