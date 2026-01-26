# Add Environment Variable

When adding a new environment variable to an app, follow these steps:

## 1. Locate the env file

Find the `env.ts` or `env.mjs` file in the app that uses `@t3-oss/env-nextjs`. Common locations:
- `apps/<app-name>/src/env.ts`
- `apps/<app-name>/src/lib/env.ts`

## 2. Add the variable in the correct section

The `createEnv` function has three sections:

- **`client`**: For variables prefixed with `NEXT_PUBLIC_` (exposed to browser)
- **`server`**: For server-only variables (secrets, API keys, configuration)
- **`shared`**: For variables used in both client and server (like `NODE_ENV`)

## 3. Define the schema with Zod

Use appropriate Zod schemas with validation:

```typescript
// Required string
MY_VAR: z.string(),

// Optional string
MY_VAR: z.string().optional(),

// String with default value (preferred over defaults elsewhere in code)
MY_VAR: z.string().optional().default("default-value"),

// Number (use z.coerce for env vars)
MY_VAR: z.coerce.number().optional().default(5000),

// Enum
MY_VAR: z.enum(["option1", "option2"]).optional().default("option1"),

// Boolean (use the booleanSchema helper already defined in the file)
MY_VAR: booleanSchema.optional().default("false"),

// Positive number with constraints
MY_VAR: z.coerce.number().positive().optional().default(14),

// Comma-separated list transformed to array
MY_VAR: z
  .string()
  .optional()
  .transform((s) => {
    if (!s) return [];
    return s.split(",").map((item) => item.trim());
  }),
```

## 4. Add a comment describing the variable

Add a JSDoc-style comment above the variable explaining its purpose:

```typescript
server: {
  // Timeout in milliseconds for Algolia API requests
  ALGOLIA_TIMEOUT_MS: z.coerce.number().optional().default(5000),

  // Number of items to process in a single batch during Strapi sync
  STRAPI_BATCH_SIZE: z.coerce.number().optional().default(50),
}
```

## 5. Add to runtimeEnv

Every variable must also be added to the `runtimeEnv` object:

```typescript
runtimeEnv: {
  // ... existing vars
  MY_VAR: process.env.MY_VAR,
}
```

## 6. Default values policy

**Always define default values in the env.ts file, not in the consuming code.**

Bad:
```typescript
// In env.ts
MY_TIMEOUT: z.coerce.number().optional(),

// In some-service.ts
const timeout = env.MY_TIMEOUT ?? 5000; // DON'T DO THIS
```

Good:
```typescript
// In env.ts
// Timeout for external API calls in milliseconds
MY_TIMEOUT: z.coerce.number().optional().default(5000),

// In some-service.ts
const timeout = env.MY_TIMEOUT; // Already has the default
```

## 7. Update .env.example (if exists)

If the app has a `.env.example` file, add the new variable there with a placeholder or example value.

## Complete example

Adding `MY_SERVICE_TIMEOUT_MS` to the CMS app:

```typescript
// In apps/cms/src/env.ts
export const env = createEnv({
  server: {
    // ... existing vars

    // Timeout in milliseconds for My Service API calls
    MY_SERVICE_TIMEOUT_MS: z.coerce.number().optional().default(10_000),
  },
  runtimeEnv: {
    // ... existing vars
    MY_SERVICE_TIMEOUT_MS: process.env.MY_SERVICE_TIMEOUT_MS,
  },
});
```

Usage in code:
```typescript
import { env } from "@/env";

const client = new MyServiceClient({
  timeout: env.MY_SERVICE_TIMEOUT_MS,
});
```