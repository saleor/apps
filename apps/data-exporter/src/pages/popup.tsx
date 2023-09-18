import { NextPage } from "next";
import React from "react";

import { Box, Text } from "@saleor/macaw-ui/next";

const PopupPage: NextPage = () => {
  return (
    <Box>
      <Box __marginBottom="100px">
        <Text
          variant={"hero"}
          size={"medium"}
          as={"h1"}
          marginBottom={5}
          data-testid={"root-heading"}
        >
          Popup page
        </Text>
      </Box>
    </Box>
  );
};

export default PopupPage;
