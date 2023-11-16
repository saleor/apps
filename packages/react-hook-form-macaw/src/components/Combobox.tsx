import {
  Combobox as $Combobox,
  type ComboboxProps as $ComboboxProps,
  Option,
} from "@saleor/macaw-ui";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type ComboboxProps<T extends FieldValues = FieldValues> = Omit<
  $ComboboxProps<Option, T>,
  "name" | "value"
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
          // @ts-ignore todo: fix
          <$Combobox
            {...rest}
            {...field}
            options={options}
            onChange={(option) => {
              onChange(option?.value ?? null);
            }}
            value={options.find((o) => o.value === value) || null}
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
