import packageJson from "../../package.json";

/**
 * Identifies the testclient in Saleor's access logs.
 * Server-side only: Chrome ignores User-Agent and Firefox would add it to the CORS preflight.
 */
export const saleorRequestHeaders = {
  "User-Agent": `${packageJson.name}/${packageJson.version}`,
};
