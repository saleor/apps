import { BoxProps, Box } from "@saleor/macaw-ui/next";

export const ButtonsBox = (props: BoxProps) => {
  return <Box display={"flex"} justifyContent="flex-end" gap={4} {...props} />;
};
