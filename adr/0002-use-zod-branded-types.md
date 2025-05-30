# 2. Use Zod Branded Types

Date: 2025-05-30

## Status

Accepted

## Context

In many places across our applications, we pass important parameters as primitive values (e.g. strings or numbers). This can lead to mistakes, such as accidentally passing an appId where a saleorApiUrl is expected. While using classes for strong typing is possible, it introduces significant boilerplate and isn’t practical for every simple value.

Zod’s branded types offer a lightweight alternative, allowing us to create distinct, type-safe primitives with minimal overhead.

## Decision

We will use Zod’s [.brand()](https://zod.dev/api?id=branded-types) function to create branded types for simple values that do not require additional methods or logic.

### Example

Defining a branded type for saleorApiUrl:

```ts
import { z } from "zod";

const saleorApiUrlSchema = z
  .string()
  .url()
  .endsWith("/graphql/")
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: 'Invalid input: must start with "http://" or "https://"',
  })
  .brand("SaleorApiUrl");

export const createSaleorApiUrl = (raw: string) => saleorApiUrlSchema.parse(raw);

export type SaleorApiUrl = z.infer<typeof saleorApiUrlSchema>;
```

### Usage

```ts
function setOtelAttrs = (saleorApiUrl: SaleorApiUrl) => {
    tracer.setAttrs('saleorApiUrl', saleorApiUrl)
}

const saleorApiUrl = createSaleorApiUrl(ctx.authData.saleorApiUrl);

setOtelAttrs(saleorApiUrl)
```

### Guideline

Use Zod branded types for simple value objects (e.g. URLs, IDs, tokens).

If you need additional logic (e.g. conversion methods), use a class instead.

## Consequences

When creating new apps use Zod branded types. If you are refactoring existing app consider using Zod branded types.
