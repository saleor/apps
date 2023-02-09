import { Typography } from "@material-ui/core";
import React from "react";

type WarningCause =
  | "not_in_iframe"
  | "missing_access_token"
  | "invalid_access_token"
  | "unknown_cause";

interface AccessWarningProps {
  cause?: WarningCause;
}

const warnings: Record<WarningCause, string> = {
  not_in_iframe: "The view can only be displayed in the iframe.",
  missing_access_token: "App doesn't have an access token.",
  invalid_access_token: "Access token is invalid.",
  unknown_cause: "Something went wrong.",
};

function AccessWarning({ cause = "unknown_cause" }: AccessWarningProps) {
  return (
    <div suppressHydrationWarning>
      <Typography variant="subtitle1">
        App can&apos;t be accessed outside of the Saleor Dashboard
      </Typography>
      <Typography variant="subtitle2" style={{ marginTop: "2rem" }}>
        ❌ {warnings[cause]}
      </Typography>
    </div>
  );
}

export default AccessWarning;
