import { Input as $Input, type InputProps as $InputProps } from "@saleor/macaw-ui";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type TextFieldElementProps<T extends FieldValues = FieldValues> = Omit<
  $InputProps,
  "name"
> & {
  name: FieldPath<T>;
  control: Control<T>;
};

export function Input<TFieldValues extends FieldValues = FieldValues>({
  type,
  required,
  name,
  control,
  ...rest
}: TextFieldElementProps<TFieldValues>): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <$Input
          {...rest}
          {...field}
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
