# Auditing Handlebars helpers across all instances

Two scripts find which custom Handlebars helpers customers use in their templates. Data fetching (needs production credentials) is separate from analysis (needs nothing).

## Step 1: Dump templates

```bash
pnpm --silent --filter saleor-app-smtp dump-templates > templates.jsonl
```

Connects to every installed app instance via APL, reads their SMTP configs, and writes one JSON line per event template to stdout. Progress and errors go to stderr (visible in terminal, excluded from the file). Use `--silent` to suppress pnpm's own header from stdout.

Requires the same env as the running app (`APL`, `SECRET_KEY`, DynamoDB/Upstash credentials, etc.).

Each line has this shape:

```json
{"saleorApiUrl":"https://example.saleor.cloud/graphql/","appId":"...","configId":"...","configName":"...","eventType":"ORDER_CREATED","template":"<mjml>...","subject":"Order {{order.number}}"}
```

## Step 2: Analyse helpers

```bash
pnpm --filter saleor-app-smtp audit-helpers < templates.jsonl
```

Reads the JSONL from stdin, parses every `template` and `subject` field with `Handlebars.parse()`, walks the AST, and collects helper names. Built-in helpers (`if`, `each`, `unless`, `with`, `lookup`, `log`) are excluded.

No credentials or env vars needed — runs on the JSONL file alone.

Example output:

```
================================================================================
HANDLEBARS HELPERS AUDIT
================================================================================
https://a.saleor.cloud/graphql/: eq, capitalize, formatDate
https://b.saleor.cloud/graphql/: (none)

================================================================================
SUMMARY
================================================================================
Templates processed: 84
Customers: 6
Customers using custom helpers: 1
All unique helpers: capitalize, eq, formatDate
```

## Detection rules

| AST node type     | Counted as helper when                                                   |
|-------------------|--------------------------------------------------------------------------|
| MustacheStatement | Has params or hash, e.g. `{{eq a b}}`, `{{formatDate format="YYYY"}}`   |
| BlockStatement    | Path is not a built-in, e.g. `{{#is …}}…{{/is}}`                        |
| SubExpression     | Always a helper call, e.g. `(eq a b)`                                    |

Simple variable references like `{{order.number}}` are not counted. No-arg helpers without hash (e.g. `{{now}}`) are ambiguous with variable lookups at the AST level and are not counted.

Templates that fail to parse are reported in the PARSE ERRORS section — these may indicate invalid or potentially exploitable template content that warrants manual review.
