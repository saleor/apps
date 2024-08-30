import { Box, PropsWithBox } from "@saleor/macaw-ui";

export const AppCard = ({ children, ...p }: PropsWithBox<{}>) => {
  return (
    <Box
      borderRadius={4}
      borderWidth={1}
      borderColor={"default1"}
      borderStyle={"solid"}
      padding={8}
      {...p}
    >
      {children}
    </Box>
  );
};
