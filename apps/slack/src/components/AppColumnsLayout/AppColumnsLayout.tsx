import { Box } from "@saleor/macaw-ui/next";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: Props) => {
  return (
    <Box display={"grid"} __maxWidth={"1180px"} __gridTemplateColumns={"280px auto 280px"} gap={4}>
      {children}
    </Box>
  );
};
