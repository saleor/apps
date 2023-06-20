import { Box } from "@saleor/macaw-ui/next";
import React, { PropsWithChildren } from "react";

export const AppColumns = ({ top, children }: PropsWithChildren<{ top: React.ReactNode }>) => {
  return (
    <Box display={"grid"} __gap={"64px"} __marginBottom={"64px"}>
      <Box>{top}</Box>
      <Box display={"grid"} __gridTemplateColumns={"1fr 1fr"} __rowGap={"96px"} columnGap={10}>
        {children}
      </Box>
    </Box>
  );
};
