import { Select as $Select, type SelectProps as $SelectProps } from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues, Path, PathValue } from "react-hook-form";

export type SelectProps<T extends FieldValues = FieldValues> = Omit<$SelectProps, "name"> & {
  name: FieldPath<T>;
  control: Control<T>;
};

export function Select<TFieldValues extends FieldValues = FieldValues>({
  type,
  required,
  name,
  control,
  options,
  ...rest
}: SelectProps<TFieldValues>): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <$Select
          {...rest}
          {...field}
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
