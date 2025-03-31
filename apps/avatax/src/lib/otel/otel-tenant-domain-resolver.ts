import type { LoggerContext } from "@saleor/apps-logger/node";

import { env } from "@/env";

export class OtelTenatDomainResolver {
  constructor(private deps: { loggerContext: Pick<LoggerContext, "getTenantDomain"> }) {}

  getDomain() {
    const domain = this.deps.loggerContext.getTenantDomain();

    const allowList = env.TENANT_DOMAIN_ALLOWLIST;

    /*
     * reduce cardinality of OTEL attributes - allow only domain specified in env vars
     * for the rest of the domains we will use "other" attribute
     */
    if (allowList.includes(domain)) {
      return domain;
    }

    return "other";
  }
}
