import { Box, BoxProps } from "@saleor/macaw-ui/next";

// TODO: Make it more generic, move to shared or contribute to macaw
const Section = (props: BoxProps) => {
  return (
    <Box display="grid" gap={2} {...props}>
      <Box
        __height="10px"
        backgroundColor="surfaceNeutralHighlight"
        borderRadius={2}
        __width="50%"
      />
      <Box
        __height="10px"
        backgroundColor="surfaceNeutralHighlight"
        borderRadius={2}
        __width="70%"
      />
      <Box
        __height="10px"
        backgroundColor="surfaceNeutralHighlight"
        borderRadius={2}
        __width="60%"
      />
    </Box>
  );
};

export const Skeleton = { Section };
