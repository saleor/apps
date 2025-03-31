import type { LoggerContext } from "@saleor/apps-logger/node";

import { env } from "@/env";

export class TenatDomainResolver {
  constructor(private deps: { loggerContext: LoggerContext }) {}

  getTenantDomain() {
    const domain = this.deps.loggerContext.getTenantDomain();

    const allowList = env.TENANT_DOMAIN_ALLOWLIST;

    /*
     * reduce cardinality of tags - allow only domain specified in env vars
     * for the rest of the domains we will use "other" tag
     */
    if (allowList.includes(domain)) {
      return domain;
    }

    return "other";
  }
}
