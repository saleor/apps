"use client";

import { PermissionGatedRedirectButton } from "./permission-gated-redirect-button";
import { type PrimaryActionProps } from "./types";

export const OrdersButton = ({ onClick }: PrimaryActionProps) => (
  <PermissionGatedRedirectButton
    label="Go to orders"
    to="/orders/"
    permission="MANAGE_ORDERS"
    missingPermissionTooltip="You don't have permission to manage orders"
    onClick={onClick}
  />
);
