import { Box, PropsWithBox } from "@saleor/macaw-ui/next";

type Props = PropsWithBox<{}>;

export const Section = (props: Props) => {
  return (
    <Box
      padding={5}
      borderColor="neutralHighlight"
      borderWidth={1}
      borderStyle="solid"
      borderRadius={4}
      {...props}
    />
  );
};
