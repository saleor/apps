import {
  Multiselect as $Multiselect,
  Option,
  type MultiselectProps as $MultiselectProps,
} from "@saleor/macaw-ui";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

export type MultiselectProps<T extends FieldValues = FieldValues> = Omit<
  /*
   * todo we can go back to string-type value
   * https://github.com/saleor/macaw-ui/blob/canary/src/components/Combobox/Static/Combobox.tsx#L171
   */
  $MultiselectProps<Option, T>,
  "name" | "value"
> & {
  name: FieldPath<T>;
  control: Control<T>;
  options: Option[];
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
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <$Multiselect
          {...rest}
          {...field}
          options={options}
          value={
            options.filter((o) => {
              // TODO: Cant resolve array properly so casting needed
              const v = (Array.isArray(value) ? value : [value]) as string[];

              return v.includes(o.value);
            }) || []
          }
          onChange={(values) => {
            onChange(
              values.map((v) => {
                return typeof v === "string" ? v : v.value;
              }),
            );
          }}
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
