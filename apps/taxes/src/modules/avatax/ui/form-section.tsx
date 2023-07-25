import { Box, Text } from "@saleor/macaw-ui/next";
import React, { PropsWithChildren } from "react";

export const FormSection = ({
  title,
  subtitle,
  children,
  disabled = false,
}: PropsWithChildren<{ title: string; subtitle?: string; disabled?: boolean }>) => {
  return (
    <>
      <Text
        marginBottom={4}
        as="h3"
        variant="heading"
        {...(disabled && { color: "textNeutralDisabled" })}
      >
        {title}
      </Text>
      {subtitle && (
        <Text as="p" marginBottom={4} {...(disabled && { color: "textNeutralDisabled" })}>
          {subtitle}
        </Text>
      )}
      <Box display="grid" gridTemplateColumns={2} gap={12}>
        {children}
      </Box>
    </>
  );
};
