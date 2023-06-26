import { Toggle as $Toggle } from "@saleor/macaw-ui/next";
import { Control, Controller, FieldPath, FieldValues, Path, PathValue } from "react-hook-form";

// ! ToggleProps is not exported from macaw-ui
type $ToggleProps = React.ComponentProps<typeof $Toggle>;

export type ToggleProps<T extends FieldValues = FieldValues> = Omit<$ToggleProps, "name"> & {
  name: FieldPath<T>;
  control: Control<T>;
};

export function Toggle<TFieldValues extends FieldValues = FieldValues>({
  type,
  name,
  control,
  ...rest
}: ToggleProps<TFieldValues>): JSX.Element {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => {
        return (
          <$Toggle
            {...rest}
            {...field}
            pressed={value}
            // TODO: write tests to make sure the cast is safe
            onPressedChange={(e) => onChange(e as PathValue<TFieldValues, Path<TFieldValues>>)}
            name={name}
            type={type}
          />
        );
      }}
    />
  );
}
