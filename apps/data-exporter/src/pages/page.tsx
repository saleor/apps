import { NextPage } from "next";
import React from "react";

import { Box, Text } from "@saleor/macaw-ui/next";

const PagePage: NextPage = () => {
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
          Page extension
        </Text>
      </Box>
    </Box>
  );
};

export default PagePage;
