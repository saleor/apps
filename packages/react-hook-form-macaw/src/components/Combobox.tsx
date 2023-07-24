import { Combobox as $Combobox, type ComboboxProps as $ComboboxProps } from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type ComboboxProps<T extends FieldValues = FieldValues> = Omit<$ComboboxProps<T>, "name"> & {
  name: FieldPath<T>;
  control: Control<T>;
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
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <$Combobox
          {...rest}
          {...field}
          options={options}
          onChange={(option) => {
            onChange(option.value);
          }}
          value={value || null}
          name={name}
          required={required}
          type={type}
          error={!!error}
          helperText={rest.helperText}
        />
      )}
    />
  );
}
