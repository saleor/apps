import { Button, type ButtonProps } from "@saleor/macaw-ui";
import { forwardRef, type ReactElement } from "react";

export type IconButtonProps = Omit<ButtonProps, "children" | "icon"> & {
  icon: ReactElement;
  /** Accessible name — required when the button has no visible text. */
  "aria-label": string;
};

/**
 * Icon-only control matching Dashboard tertiary icon buttons
 * (e.g. list-row disconnect / delete affordances).
 *
 * Forwards the ref: Macaw `Dropdown.Trigger` is Radix `asChild` and attaches the open handler
 * to whatever this renders. A wrapper that drops the ref is a button that never opens the menu.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "tertiary", size = "small", type = "button", ...props }, ref) => (
    <Button ref={ref} variant={variant} size={size} type={type} icon={icon} {...props} />
  ),
);

IconButton.displayName = "IconButton";
