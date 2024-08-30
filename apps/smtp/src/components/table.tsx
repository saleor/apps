import { Box, BoxProps } from "@saleor/macaw-ui";

export const Table = {
  Container: (props: BoxProps) => <Box __textAlign={"left"} width="100%" {...props} as="table" />,
  Header: (props: BoxProps) => <Box {...props} as="thead" />,
  Row: (props: BoxProps) => <Box {...props} as="tr" />,
  HeaderCell: (props: BoxProps) => <Box fontWeight="regular" fontSize={1} {...props} as="th" />,
  Body: (props: BoxProps) => <Box {...props} as="tbody" />,
  Cell: (props: BoxProps) => <Box fontSize={4} {...props} as="td" />,
};
