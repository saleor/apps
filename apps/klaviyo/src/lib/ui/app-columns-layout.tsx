import { Box } from "@saleor/macaw-ui/next";
import { PropsWithChildren } from "react";

export function AppColumnsLayout({ children }: PropsWithChildren<{}>) {
  return (
    <Box
      display={"grid"}
      __gridTemplateColumns={"280px auto 280px"}
      gap={4}
      __maxWidth={"1180px"}
      __margin={"0 auto"}
    >
      {children}
    </Box>
  );
}
