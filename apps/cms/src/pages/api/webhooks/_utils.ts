interface UnknownIssuingPrincipal {
  __typename?: string;
}

export const isAppWebhookIssuer = <T extends UnknownIssuingPrincipal | null | undefined>(
  issuingPrincipal: T,
  appId: string
) =>
  issuingPrincipal &&
  (!issuingPrincipal.__typename || issuingPrincipal.__typename === "App") &&
  "id" in issuingPrincipal &&
  issuingPrincipal.id === appId;
