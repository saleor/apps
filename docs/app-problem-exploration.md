# AppProblem Adoption: Exploration Results & Proposed Cases

## Context

Saleor 3.22 introduced `appProblemCreate` — a GraphQL mutation that lets apps report persistent problems visible to merchants in the Saleor Dashboard. Currently **no app in this monorepo uses it**. The API is present in every app's `schema.graphql` but zero `.graphql` operations, generated types, or calling code exist.

### API Surface (Saleor 3.22+)

```graphql
mutation appProblemCreate(input: AppProblemCreateInput!): AppProblemCreate

input AppProblemCreateInput {
  message: String!           # What to tell the merchant (3-2048 chars)
  key: String!               # Groups/deduplicates problems of same type (3-128 chars)
  criticalThreshold: Int     # Count at which problem becomes "critical"
  aggregationPeriod: Minute  # Window for grouping same-key problems (default 60, 0 = always new)
}

# Dismiss by IDs or keys
mutation appProblemDismiss(input: AppProblemDismissInput!): AppProblemDismiss
```

---

## Proposed AppProblem Cases Per App

### Legend
- **Severity**: CRITICAL (payment/order impact), HIGH (data loss/silent failure), MEDIUM (degraded feature)
- **Type**: CONFIG (wrong setup), SERVICE (external API issue), DATA (content/payload issue), BUG (code defect)

---

### AvaTax (6 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| AX-1 | `avatax-invalid-credentials` | AvaTax API credentials expired/revoked mid-operation | Generic 500, client log says "AvaTax API returned an error" | CRITICAL | SERVICE |
| AX-2 | `avatax-forbidden-access` | API key lacks required permissions (PermissionRequired) | Generic 500, no distinction from transient error | HIGH | CONFIG |
| AX-3 | `avatax-company-inactive` | AvaTax company account deactivated | Sentry + generic "system error", raw faultSubCode in client log | CRITICAL | SERVICE |
| AX-4 | `avatax-company-not-found` | Wrong company code configured | Same as AX-3, not distinguished | HIGH | CONFIG |
| AX-5 | `avatax-suspicious-zero-tax` | Products calculating zero tax when rate is non-zero | Only `logger.warn` internally, never in client logs | HIGH | DATA |
| AX-6 | `avatax-tax-code-permission` | API key can't list tax codes (missing permission scope) | Generic tRPC error in UI | MEDIUM | CONFIG |

---

### Stripe (4 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| ST-1 | `stripe-auth-failure` | Stripe restricted key expired/invalid | Generic "There is a problem with the request to Stripe API" | CRITICAL | SERVICE |
| ST-2 | `stripe-permission-error` | Stripe key lacks permission for operation | Same generic message as ST-1 | CRITICAL | CONFIG |
| ST-3 | `stripe-webhook-secret-mismatch` | Webhook signature verification failing | `logger.error` only, no Sentry, payments stuck | CRITICAL | CONFIG |
| ST-4 | `stripe-config-missing` | Stripe config deleted but webhook endpoint still active | `logger.error` only, events silently discarded | HIGH | CONFIG |

---

### NP Atobarai (3 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| NP-1 | `atobarai-auth-failure` | API authentication failed (error code E0100025) | Raw error code in response, no human-readable message | CRITICAL | CONFIG |
| NP-2 | `atobarai-fulfillment-failed` | Fulfillment report to Atobarai failed (payment settlement blocked) | `logger.warn` + order note only, no Sentry | HIGH | SERVICE |
| NP-3 | `atobarai-db-write-failed` | DynamoDB write fails after successful payment authorization | `logger.error` + generic "App is not working" 500 | CRITICAL | SERVICE |

**Bonus bug found**: `verifyCredentials()` in `atobarai-api-client.ts` line 249 has a copy-paste bug — `const is403 = result.value.status === 401` (should be `403`), so forbidden responses are silently accepted as valid credentials.

---

### SMTP (5 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| SM-1 | `smtp-connection-failed` | SMTP server unreachable (wrong host/port/TLS/auth) | `logger.info`, HTTP 400, no Sentry | HIGH | CONFIG |
| SM-2 | `smtp-timeout` | SMTP server consistently timing out (4s limit) | `logger.info`, HTTP 400, no Sentry | HIGH | SERVICE |
| SM-3 | `smtp-invalid-sender` | Missing sender name or email in configuration | `logger.info`, HTTP 400, no Sentry | HIGH | CONFIG |
| SM-4 | `smtp-template-error` | Handlebars/MJML template fails at send time (passes validation with empty data) | `logger.info`, HTTP 400, no Sentry | MEDIUM | CONFIG |
| SM-5 | `smtp-554-rejection` | Sender domain/IP blacklisted (SMTP 554) | `logger.info`, HTTP 400, no Sentry | HIGH | SERVICE |

---

### Search / Algolia (3 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| SR-1 | `algolia-auth-error` | Algolia API key expired/revoked (401/403) | `logger.error` + 500, `isAuthError()` detection exists but is never called in handlers | HIGH | CONFIG |
| SR-2 | `algolia-record-too-large` | Product exceeds Algolia's 10KB limit | HTTP 413 to Saleor with good message, but never shown in dashboard | MEDIUM | DATA |
| SR-3 | `algolia-index-setup-failed` | Index rebuild fails (auth/network error) | `logger.error` + 500, no error body | MEDIUM | SERVICE |

---

### CMS (4 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| CM-1 | `cms-provider-auth-error` | CMS provider credentials invalid (Contentful/Strapi/DatoCMS/Builder.io/PayloadCMS) | Varies: uncaught exception or silent success | HIGH | CONFIG |
| CM-2 | `cms-builder-io-silent-failure` | Builder.io never checks HTTP response status — uploads silently fail | **Completely silent** — no error, no log, variant appears synced | CRITICAL | BUG |
| CM-3 | `cms-field-mismatch` | Contentful field name mismatch causes 422 on update | Sentry only (Contentful), no merchant notification | MEDIUM | CONFIG |
| CM-4 | `cms-sync-failure` | Webhook-triggered variant sync fails for any provider | Uncaught exception, no `captureException` for most providers | HIGH | SERVICE |

---

### Klaviyo (2 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| KL-1 | `klaviyo-api-error` | Klaviyo API rejects event (invalid token, rate limit) | `logger.error` only, legacy API returns plain "0" not JSON | HIGH | CONFIG |
| KL-2 | `klaviyo-missing-email` | Events dropped because customer has no email | `logger.warn` + 400, no merchant visibility | MEDIUM | DATA |

**Note**: Klaviyo currently accepts any string as API token at config time without validation against Klaviyo's API.

---

### Segment (3 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| SG-1 | `segment-config-missing` | Config missing from DynamoDB — all events silently dropped with HTTP 200 | `logger.warn`, HTTP 200 to Saleor (so Saleor thinks it worked) | CRITICAL | CONFIG |
| SG-2 | `segment-tracking-failed` | Segment rejects events (bad write key, network error) | analytics-node library absorbs 4xx silently | HIGH | SERVICE |
| SG-3 | `segment-webhooks-disabled` | Webhook enable fails after config save, app left in inconsistent state | One-time tRPC error toast, no persistent indicator | MEDIUM | SERVICE |

**Note**: Segment write key is accepted without any API validation. The analytics-node library silently swallows errors for invalid keys.

---

### Products Feed (3 cases)

| # | Key | Problem | Current Behavior | Severity | Type |
|---|-----|---------|-----------------|----------|------|
| PF-1 | `feed-s3-upload-failed` | S3 credentials expired/bucket permissions changed post-config | HTTP 500, `logger.error`, no merchant notification | HIGH | SERVICE |
| PF-2 | `feed-empty-products` | GraphQL errors produce empty product array — empty feed uploaded to S3, products de-listed from Google | `logger.error` + returns `[]`, feed generation continues with no products | **CRITICAL** | DATA |
| PF-3 | `feed-s3-not-configured` | S3 not configured when feed URL is accessed | Generic 400 "App not configured" | MEDIUM | CONFIG |

---

## Priority Ranking (Top 10 Most Impactful)

1. **PF-2** `feed-empty-products` — Can de-list all products from Google Shopping silently
2. **SG-1** `segment-config-missing` — Total silent failure, HTTP 200 masks the problem
3. **ST-3** `stripe-webhook-secret-mismatch` — All payment status updates stop, payments stuck
4. **CM-2** `cms-builder-io-silent-failure` — Completely invisible failure, no log/error/anything
5. **AX-1** `avatax-invalid-credentials` — All tax calculations fail with opaque error
6. **ST-1** `stripe-auth-failure` — All payments fail with generic message
7. **AX-3** `avatax-company-inactive` — Persistent failure indistinguishable from transient
8. **SM-1** `smtp-connection-failed` — All emails fail, logged as `info`, no Sentry
9. **NP-3** `atobarai-db-write-failed` — Transaction in inconsistent state
10. **SR-1** `algolia-auth-error` — Detection code exists but is never called

---

## Summary Statistics

- **Total cases identified**: 33
- **CRITICAL severity**: 11
- **HIGH severity**: 16
- **MEDIUM severity**: 6
- **By type**: CONFIG (17), SERVICE (12), DATA (3), BUG (1)

This document is an **exploration report only**. The next step is to decide which apps/cases to tackle first and how to structure the shared `appProblemCreate` utility.
