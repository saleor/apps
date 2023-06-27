import { Box } from "@saleor/macaw-ui/next";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: Props) => {
  return (
    <Box
      paddingX={8}
      display={"grid"}
      marginTop={8}
      __maxWidth={"1180px"}
      __gridTemplateColumns={"380px auto"}
      gap={8}
    >
      {children}
    </Box>
  );
};
