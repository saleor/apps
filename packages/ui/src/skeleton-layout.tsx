import { Box, BoxProps, Skeleton as MacawSkeleton, SkeletonProps } from "@saleor/macaw-ui";

const Section = (props: BoxProps) => {
  return (
    <Box display="grid" gap={2} {...props}>
      <MacawSkeleton __height="16px" __width="50%" />
      <MacawSkeleton __height="16px" __width="70%" />
      <MacawSkeleton __height="16px" __width="60%" />
    </Box>
  );
};

const Line = (props: SkeletonProps) => {
  return <MacawSkeleton __height="16px" __width="60%" {...props} />;
};

export const SkeletonLayout = { Section, Line };
