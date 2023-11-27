import { Box, BoxProps, Skeleton } from "@saleor/macaw-ui";

const TableSkeletonRow = () => {
  return (
    <Box display="grid" gridTemplateColumns={3} gap={8}>
      <Skeleton __width={"100%"} height={6} />
      <Skeleton __width={"100%"} height={6} />
      <Skeleton __width={"100%"} height={6} />
    </Box>
  );
};

const TableSkeleton = () => {
  return (
    <Box display="grid" gap={4} marginTop={4}>
      <Skeleton __width={"100%"} height={6} />
      <Box display="grid" gap={4}>
        <TableSkeletonRow />
        <TableSkeletonRow />
        <TableSkeletonRow />
      </Box>
    </Box>
  );
};

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
  Skeleton: () => <TableSkeleton />,
};
