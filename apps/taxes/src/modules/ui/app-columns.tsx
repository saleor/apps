import { Box } from "@saleor/macaw-ui/next";
import React from "react";

export const AppColumns = ({
  top,
  bottomLeft,
  bottomRight,
}: {
  top: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
}) => {
  return (
    <Box display={"grid"} __gap={"60px"}>
      <Box>{top}</Box>
      <Box display={"grid"} gridTemplateColumns={2} gap={10}>
        <Box>{bottomLeft}</Box>
        <Box>{bottomRight}</Box>
      </Box>
    </Box>
  );
};
