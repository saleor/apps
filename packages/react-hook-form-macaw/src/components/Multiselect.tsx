import {
  Multiselect as $Multiselect,
  type MultiselectProps as $MultiselectProps,
} from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type MultiselectProps<T extends FieldValues = FieldValues> = Omit<
  $MultiselectProps,
  "name"
> & {
  name: FieldPath<T>;
  control: Control<T>;
};

export function Multiselect<TFieldValues extends FieldValues = FieldValues>({
  type,
  required,
  name,
  control,
  options,
  ...rest
}: MultiselectProps<TFieldValues>): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, ...field }, fieldState: { error } }) => (
        <$Multiselect
          {...rest}
          {...field}
          options={options}
          value={value || []}
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
