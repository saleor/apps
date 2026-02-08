import { Box, Text } from "@saleor/macaw-ui";
import { type ReactNode } from "react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  isDirty?: boolean;
}

export const TabButton = ({ active, onClick, children, isDirty }: TabButtonProps) => (
  <Box
    as="button"
    type="button"
    onClick={onClick}
    display="flex"
    alignItems="center"
    gap={1.5}
    paddingX={4}
    paddingY={3.5}
    backgroundColor="transparent"
    borderWidth={0}
    cursor="pointer"
    opacity={active ? "1" : "0.6"}
    style={{
      transition: "opacity 0.15s ease",
      borderBottom: active ? "2px solid currentColor" : "2px solid transparent",
    }}
  >
    <Text size={2} fontWeight={active ? "bold" : "regular"}>
      {children}
    </Text>
    {isDirty && (
      <Box
        as="span"
        width={1.5}
        height={1.5}
        borderRadius={7}
        backgroundColor="default1"
        style={{ opacity: 0.7 }}
        title="Unsaved changes"
      />
    )}
  </Box>
);
