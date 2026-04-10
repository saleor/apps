/**
 * Builds the full redirect endpoint URL by appending the Saleor instance
 * hostname to the configured base endpoint.
 */
export const buildRedirectEndpointUrl = ({
  endpointUrl,
  saleorApiUrl,
}: {
  endpointUrl: string;
  saleorApiUrl: string;
}): string => {
  const saleorHostname = new URL(saleorApiUrl).hostname;
  const baseUrl = endpointUrl.endsWith("/") ? endpointUrl : `${endpointUrl}/`;

  return `${baseUrl}${saleorHostname}/`;
};
