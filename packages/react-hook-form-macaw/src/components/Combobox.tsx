import { Combobox as $Combobox, type ComboboxProps as $ComboboxProps } from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues, Path, PathValue } from "react-hook-form";

export type ComboboxProps<T extends FieldValues = FieldValues> = Omit<$ComboboxProps, "name"> & {
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
          // TODO: write tests to make sure the cast is safe
          onChange={(e) => onChange(e as PathValue<TFieldValues, Path<TFieldValues>>)}
          options={options}
          value={value || ""}
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
