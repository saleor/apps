"use client";

import { Button } from "@saleor/macaw-ui";

import { useAppRedirect } from "../../hooks/use-app-redirect";
import { type PrimaryActionProps } from "./types";

export const ExtensionsButton = ({ onClick }: PrimaryActionProps) => {
  const redirect = useAppRedirect();

  return (
    <Button
      variant="primary"
      onClick={() => {
        onClick?.();
        redirect("/extensions/installed-extensions");
      }}
    >
      Go to Extensions
    </Button>
  );
};
