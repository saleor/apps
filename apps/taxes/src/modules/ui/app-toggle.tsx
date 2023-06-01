import { Box, Text } from "@saleor/macaw-ui/next";
import { Toggle, ToggleProps } from "@saleor/react-hook-form-macaw";
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { T } from "vitest/dist/types-e3c9754d";

type AppToggleProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  ToggleProps<TFieldValues>,
  "children"
> & {
  label: string;
  helperText?: React.ReactNode;
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
};

export const AppToggle = <TFieldValues extends FieldValues = FieldValues>({
  label,
  helperText,
  ...p
}: AppToggleProps<TFieldValues>) => {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={4}>
      <Toggle {...p}>
        <Text marginLeft={4}>{label}</Text>
      </Toggle>
      {typeof helperText === "string" ? (
        <Text variant="caption" color="textNeutralSubdued">
          {helperText}
        </Text>
      ) : (
        helperText
      )}
    </Box>
  );
};
