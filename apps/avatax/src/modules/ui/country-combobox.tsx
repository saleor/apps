import { Combobox, ComboboxProps } from "@saleor/react-hook-form-macaw";
import { Control, FieldPath, FieldValues } from "react-hook-form";

import { countries } from "./countries";

type CountryComboboxProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  ComboboxProps<TFieldValues>,
  "options"
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
};

export const CountryCombobox = <TFieldValues extends FieldValues = FieldValues>({
  helperText,
  ...p
}: CountryComboboxProps<TFieldValues>) => {
  return <Combobox {...p} options={countries} />;
};
