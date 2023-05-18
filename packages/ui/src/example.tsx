import { Box } from "@saleor/macaw-ui/next";
import { PropsWithChildren } from "react";

type ExampleProps = PropsWithChildren<{}>;

export const Example = ({ children }: ExampleProps) => {
  return <Box>{children}</Box>;
};
