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
  ...p
}: CountrySelectProps<TFieldValues>) => {
  return <Select {...p} options={countries} />;
};
