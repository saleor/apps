import { Box } from "@saleor/macaw-ui/next";
import React, { PropsWithChildren } from "react";

export const AppColumns = ({ top, children }: PropsWithChildren<{ top: React.ReactNode }>) => {
  return (
    <Box display={"grid"} __gap={"60px"}>
      <Box>{top}</Box>
      <Box display={"grid"} gap={10} __gridTemplateColumns={"1fr 1fr"}>
        {children}
      </Box>
    </Box>
  );
};
