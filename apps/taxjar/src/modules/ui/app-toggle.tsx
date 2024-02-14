import { Box, Text } from "@saleor/macaw-ui";
import { Toggle, ToggleProps } from "@saleor/react-hook-form-macaw";
import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

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
      {/* without type="button", radix toggle value change triggers form submission */}
      <Toggle type="button" {...p}>
        <Text marginLeft={2}>{label}</Text>
      </Toggle>
      {helperText}
    </Box>
  );
};
