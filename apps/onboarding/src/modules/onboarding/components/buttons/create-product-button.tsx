"use client";

import { PermissionGatedRedirectButton } from "./permission-gated-redirect-button";
import { type PrimaryActionProps } from "./types";

export const CreateProductButton = ({ onClick }: PrimaryActionProps) => (
  <PermissionGatedRedirectButton
    label="Go to all products"
    to="/products/"
    permission="MANAGE_PRODUCTS"
    missingPermissionTooltip="You don't have permission to manage products"
    onClick={onClick}
  />
);
