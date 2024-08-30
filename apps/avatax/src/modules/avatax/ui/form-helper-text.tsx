import { Text } from "@saleor/macaw-ui";
import React from "react";

export const HelperText = ({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  return (
    <Text
      color={disabled ? "defaultDisabled" : "default2"}
      fontWeight="regular"
      marginTop={2}
      as="p"
    >
      {children}
    </Text>
  );
};
