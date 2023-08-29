import {
  Combobox as $Combobox,
  type ComboboxProps as $ComboboxProps,
  Option,
} from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type ComboboxProps<T extends FieldValues = FieldValues> = Omit<
  $ComboboxProps<T, T>,
  "name"
> & {
  name: FieldPath<T>;
  control: Control<T>;
  options: Option[];
};

export function Combobox<TFieldValues extends FieldValues = FieldValues>({
  type,
  required,
  name,
  control,
  options,
  ...rest
}: ComboboxProps<TFieldValues>): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => {
        return (
          <$Combobox
            {...rest}
            {...field}
            options={options}
            onChange={(option) => {
              onChange(option?.value ?? null);
            }}
            value={options.find((o: Option) => o.value === value) || null}
            name={name}
            required={required}
            type={type}
            error={!!error}
            helperText={rest.helperText}
          />
        );
      }}
    />
  );
}
