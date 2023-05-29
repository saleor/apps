import { PropsWithBox, Box } from "@saleor/macaw-ui/next";

export const AppCard = ({ children, ...p }: PropsWithBox<{}>) => {
  return (
    <Box
      borderRadius={4}
      borderWidth={1}
      borderColor={"neutralPlain"}
      borderStyle={"solid"}
      padding={8}
      {...p}
    >
      {children}
    </Box>
  );
};
