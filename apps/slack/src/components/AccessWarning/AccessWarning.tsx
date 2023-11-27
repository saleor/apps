import React from "react";
import { Text } from "@saleor/macaw-ui";

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

export function AccessWarning({ cause = "unknown_cause" }: AccessWarningProps) {
  return (
    <div>
      <Text as={"h2"} variant="heading">
        App can&apos;t be accessed outside of the Saleor Dashboard
      </Text>
      <Text variant="body" style={{ marginTop: "2rem" }}>
        ❌ {warnings[cause]}
      </Text>
    </div>
  );
}
