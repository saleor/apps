import { Box, Text } from "@saleor/macaw-ui/next";
import { PropsWithChildren } from "react";

const MAX_WIDTH = "480px";

const Header = ({ children }: PropsWithChildren) => {
  return (
    <Box __maxWidth={MAX_WIDTH}>
      <Text as="p" variant="body">
        {children}
      </Text>
    </Box>
  );
};

const Description = ({
  title,
  description,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
}) => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10} __maxWidth={MAX_WIDTH}>
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
