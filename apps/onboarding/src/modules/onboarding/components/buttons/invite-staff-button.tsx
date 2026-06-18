"use client";

import { PermissionGatedRedirectButton } from "./permission-gated-redirect-button";
import { type PrimaryActionProps } from "./types";

export const InviteStaffButton = ({ onClick }: PrimaryActionProps) => (
  <PermissionGatedRedirectButton
    label="Invite members"
    to="/staff/?action=add"
    permission="MANAGE_STAFF"
    missingPermissionTooltip="You don't have permission to manage staff"
    onClick={onClick}
  />
);
