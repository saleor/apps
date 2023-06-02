import { Box } from "@saleor/macaw-ui/next";
import { Select, SelectProps } from "@saleor/react-hook-form-macaw";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { countries } from "./countries";

type CountrySelectProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  SelectProps<TFieldValues>,
  "options"
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
};

export const CountrySelect = <TFieldValues extends FieldValues = FieldValues>({
  helperText,
  value,
  ...p
}: CountrySelectProps<TFieldValues>) => {
  return (
    <Box display={"flex"} flexDirection={"column"} gap={4}>
      <Select {...p} options={countries} />
    </Box>
  );
};
