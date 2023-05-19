import { Box } from "@saleor/macaw-ui/next";
import React from "react";

const ratioMap = {
  "1/1": "1fr 1fr",
  "1/2": "1fr 2fr",
};

type Ratio = keyof typeof ratioMap;

type AppColumnsProps = {
  top: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
  gridRatio?: Ratio;
};

export const AppColumns = ({
  top,
  bottomLeft,
  bottomRight,
  gridRatio = "1/1",
}: AppColumnsProps) => {
  return (
    <Box display={"grid"} __gap={"60px"}>
      <Box>{top}</Box>
      <Box display={"grid"} gap={10} __gridTemplateColumns={ratioMap[gridRatio]}>
        <Box>{bottomLeft}</Box>
        <Box>{bottomRight}</Box>
      </Box>
    </Box>
  );
};
