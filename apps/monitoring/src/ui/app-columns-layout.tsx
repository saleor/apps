import { PropsWithChildren } from "react";
import { Box } from "@saleor/macaw-ui/next";

type Props = PropsWithChildren<{}>;

export function AppColumnsLayout({ children }: Props) {
  return (
    <Box display="grid" __gridTemplateColumns={"200px minmax(auto, 700px)"} gap={4}>
      {children}
    </Box>
  );
}
