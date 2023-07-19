import { Text } from "@saleor/macaw-ui/next";
import React from "react";

export const HelperText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="textNeutralSubdued" fontWeight={"captionLarge"}>
      {children}
    </Text>
  );
};
