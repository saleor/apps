#changelog
---
"apps": minor
---
### Added

- `apps/emails-and-messages/.env.template`: Described the new environment variable and how it works
- `apps/emails-and-messages/src/saleor-app.ts`: Added case "redis" for switch(AplType), which takes advantage of the [RedisAPL PR](https://github.com/saleor/app-sdk/pull/287) I submitted
