import { Select as _Select } from "@saleor/macaw-ui/next";

type SelectProps = React.ComponentProps<typeof _Select>;
/**
 * The macaw-ui Select doesn't truncate the label text, so we need to override it.
 * @see: https://github.com/saleor/macaw-ui/issues/477
 */
export const Select = (props: SelectProps) => {
  return (
    <_Select
      {...props}
      __whiteSpace={"preline"}
      __overflow={"hidden"}
      __textOverflow={"ellipsis"}
    />
  );
};
