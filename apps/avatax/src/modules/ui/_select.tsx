import { Select as _Select } from "@saleor/macaw-ui";

type SelectProps = Omit<React.ComponentProps<typeof _Select>, "value" | "onChange"> & {
  value: string | null;
  onChange: (value: string) => void;
};
/**
 * The macaw-ui Select doesn't truncate the label text, so we need to override it.
 * @see: https://github.com/saleor/macaw-ui/issues/477
 *
 * TODO: Migrate to react-hook-form-macaw bindings package
 */
export const Select = ({ value, ...props }: SelectProps) => {
  return (
    <_Select
      {...props}
      __whiteSpace={"preline"}
      __overflow={"hidden"}
      __textOverflow={"ellipsis"}
      value={props.options.find((option) => option.value === value) ?? null}
      onChange={(value) => props.onChange(value.value)}
    />
  );
};
