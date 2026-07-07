import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

interface SectionWithDescriptionProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function SectionWithDescription({
  title,
  description,
  children,
}: SectionWithDescriptionProps) {
  return (
    <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }} gap={12}>
      <Box>
        <Text size={5} fontWeight="bold" as="h2" paddingBottom={2}>
          {title}
        </Text>
        {description}
      </Box>
      {children && (
        <Box
          gridColumnStart={{ desktop: "2", mobile: "1" }}
          gridColumnEnd={{ desktop: "4", mobile: "1" }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
