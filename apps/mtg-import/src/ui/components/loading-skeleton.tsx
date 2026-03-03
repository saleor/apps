import { Box, Skeleton, Spinner, Text } from "@saleor/macaw-ui";

export const PageSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={4}>
    <Skeleton __height="32px" __width="200px" />
    <Box display="flex" gap={6} flexWrap="wrap">
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i}>
          <Skeleton __height="14px" __width="80px" />
          <Skeleton __height="28px" __width="60px" />
        </Box>
      ))}
    </Box>
    <Skeleton __height="8px" __width="100%" />
    <Skeleton __height="200px" __width="100%" />
  </Box>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Box
    padding={4}
    borderRadius={4}
    borderWidth={1}
    borderStyle="solid"
    borderColor="default1"
  >
    <Box padding={4} display="flex" flexDirection="column" gap={3}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} display="flex" gap={4} alignItems="center">
          <Skeleton __height="16px" __width="60px" />
          <Skeleton __height="16px" __width="180px" />
          <Skeleton __height="16px" __width="80px" />
          <Skeleton __height="16px" __width="60px" />
        </Box>
      ))}
    </Box>
  </Box>
);

export const InlineSpinner = ({ label }: { label?: string }) => (
  <Box display="flex" alignItems="center" gap={3} padding={4}>
    <Spinner />
    {label && <Text color="default2">{label}</Text>}
  </Box>
);
