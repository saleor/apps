"use client";

import { PermissionGatedRedirectButton } from "./permission-gated-redirect-button";
import { type PrimaryActionProps } from "./types";

export const CreateCustomAppButton = ({ onClick }: PrimaryActionProps) => (
  <PermissionGatedRedirectButton
    label="Create custom app"
    to="/extensions/custom/add"
    permission="MANAGE_APPS"
    missingPermissionTooltip="You don't have permission to manage apps"
    onClick={onClick}
  />
);
