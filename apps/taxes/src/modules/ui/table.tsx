import { Box, BoxProps } from "@saleor/macaw-ui/next";

export const Table = {
  Container: (props: BoxProps) => (
    <Box __textAlign={"left"} width="100%" style={{ tableLayout: "fixed" }} {...props} as="table" />
  ),
  THead: (props: BoxProps) => <Box {...props} as="thead" />,
  TR: (props: BoxProps) => <Box {...props} as="tr" />,
  TH: (props: BoxProps) => (
    <Box fontWeight={"captionSmall"} fontSize={"captionSmall"} {...props} as="th" />
  ),
  TBody: (props: BoxProps) => <Box {...props} as="tbody" />,
  TD: (props: BoxProps) => <Box fontSize="bodyMedium" paddingTop={2} {...props} as="td" />,
};
