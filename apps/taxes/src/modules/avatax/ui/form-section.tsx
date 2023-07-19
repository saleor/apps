import { Box, Text } from "@saleor/macaw-ui/next";
import React, { PropsWithChildren } from "react";

export const FormSection = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <>
      <Text marginBottom={4} as="h3" variant="heading">
        {title}
      </Text>
      <Box display="grid" gridTemplateColumns={2} gap={12}>
        {children}
      </Box>
    </>
  );
};
