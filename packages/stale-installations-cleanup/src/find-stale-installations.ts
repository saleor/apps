import { type AuthData } from "@saleor/app-sdk/APL";
import { BaseError } from "@saleor/errors";
import { getVercelOidcToken } from "@vercel/oidc";
import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

export const SaleorCloudCheckError = BaseError.subclass("SaleorCloudCheckError", {
  props: {
    _brand: "SaleorCloudCheckError" as const,
  },
});

/** Limit of the Cloud endpoint. */
const CHECK_BATCH_SIZE = 1000;

const checkResponseSchema = z.object({
  data: z.array(z.object({ domain: z.string(), exists: z.boolean() })),
});

const checkDomainsExist = async (
  { cloudApiUrl, oidcAudience }: { cloudApiUrl: string; oidcAudience: string },
  domains: string[],
): Promise<Map<string, boolean>> => {
  const token = await getVercelOidcToken({ audience: oidcAudience });
  const response = await fetch(
    new URL("service/environments/bulk-check-exists/", cloudApiUrl.replace(/\/?$/, "/")),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domains }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Saleor Cloud existence check returned HTTP ${response.status}`);
  }

  const { data } = checkResponseSchema.parse(await response.json());

  return new Map(data.map(({ domain, exists }) => [domain, exists]));
};

export type StaleInstallations = {
  /** saleorApiUrls of installations whose Saleor Cloud environment no longer exists. */
  stale: string[];
  /** Installations Cloud gave an answer for. */
  checked: number;
  /** Installations outside `rootDomains`, e.g. self-hosted or on a custom domain. Never stale. */
  skipped: number;
  /** Installations without a valid URL or without an answer from Cloud. Never stale. */
  unknown: number;
};

/**
 * Asks Saleor Cloud (authenticated with the deployment's Vercel OIDC token) which installations'
 * environments still exist.
 *
 * Only an explicit `exists: false` makes an installation stale. Cloud answers `false` for any
 * domain it does not host too (self-hosted Saleor, another Cloud environment), so only domains at
 * `<label>.<root domain>` of this Cloud are asked about; Cloud domain labels never contain a dot.
 */
export const findStaleInstallations = async ({
  installations,
  cloudApiUrl,
  oidcAudience,
  rootDomains,
}: {
  installations: Pick<AuthData, "saleorApiUrl">[];
  /** e.g. `https://cloud.saleor.io/platform/api` */
  cloudApiUrl: string;
  /** e.g. `https://cloud.saleor.io/platform/api:service-accounts` */
  oidcAudience: string;
  /** e.g. `["saleor.cloud", "eu.saleor.cloud"]` */
  rootDomains: string[];
}): Promise<Result<StaleInstallations, InstanceType<typeof SaleorCloudCheckError>>> => {
  const isOnRootDomains = (domain: string) =>
    rootDomains.includes(domain.slice(domain.indexOf(".") + 1));
  const domainByUrl = new Map(
    installations.map(({ saleorApiUrl }) => [saleorApiUrl, URL.parse(saleorApiUrl)?.hostname]),
  );
  const domains = [...new Set(domainByUrl.values())].filter(
    (domain): domain is string => !!domain && isOnRootDomains(domain),
  );
  const existsByDomain = new Map<string, boolean>();

  try {
    for (let i = 0; i < domains.length; i += CHECK_BATCH_SIZE) {
      const batch = await checkDomainsExist(
        { cloudApiUrl, oidcAudience },
        domains.slice(i, i + CHECK_BATCH_SIZE),
      );

      batch.forEach((exists, domain) => existsByDomain.set(domain, exists));
    }
  } catch (error) {
    return err(
      new SaleorCloudCheckError("Failed to check environments existence in Saleor Cloud", {
        cause: error,
      }),
    );
  }

  const answers = [...domainByUrl].map(([url, domain]) => ({
    url,
    skipped: !!domain && !isOnRootDomains(domain),
    exists: domain ? existsByDomain.get(domain) : undefined,
  }));

  return ok({
    stale: answers.filter(({ exists }) => exists === false).map(({ url }) => url),
    checked: answers.filter(({ exists }) => exists !== undefined).length,
    skipped: answers.filter(({ skipped }) => skipped).length,
    unknown: answers.filter(({ skipped, exists }) => !skipped && exists === undefined).length,
  });
};
