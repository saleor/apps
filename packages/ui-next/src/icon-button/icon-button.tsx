import { Button, type ButtonProps } from "@saleor/macaw-ui";
import { type ReactElement } from "react";

export type IconButtonProps = Omit<ButtonProps, "children" | "icon"> & {
  icon: ReactElement;
  /** Accessible name — required when the button has no visible text. */
  "aria-label": string;
};

/**
 * Icon-only control matching Dashboard tertiary icon buttons
 * (e.g. list-row disconnect / delete affordances).
 */
export const IconButton = ({
  icon,
  variant = "tertiary",
  size = "small",
  type = "button",
  ...props
}: IconButtonProps): JSX.Element => (
  <Button variant={variant} size={size} type={type} icon={icon} {...props} />
);

IconButton.displayName = "IconButton";
