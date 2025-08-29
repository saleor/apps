# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Saleor SMTP Application that handles email notifications for e-commerce events. It integrates with Saleor API via webhooks and sends transactional emails using SMTP configuration.

## Key Commands

### Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server (available at http://localhost:3000)
- `pnpm build` - Build the application
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm check-types` - Type checking with TypeScript

### Testing
- `pnpm test` - Run tests with Vitest in watch mode
- `pnpm test:ci` - Run tests once with coverage
- To run a single test file: `pnpm test <filename>`

### GraphQL
- `pnpm fetch-schema` - Update GraphQL schema from Saleor
- `pnpm generate` - Generate TypeScript for GraphQL, after changing queries, mutations, schema

## Architecture

### Tech Stack
- **Framework**: Next.js with TypeScript
- **API Layer**: tRPC for type-safe APIs
- **GraphQL**: URQL client with code generation
- **Database**: DynamoDB (with support for multiple APL storages - used when installing app)
- **Email Processing**: MJML for responsive email templates, Handlebars and `handlebars-helpers` for templating
- **Testing**: Vitest with React Testing Library
- **Monitoring**: Sentry and OpenTelemetry

### Directory Structure
- `/src/pages` - Next.js pages and API routes
- `/src/modules` - Feature modules with business logic
  - `smtp/` - Email configuration and sending logic
  - `trpc/` - tRPC setup and procedures
  - `webhook-management/` - Webhook handling
  - `dynamodb/` - Database client
  - `event-handlers/` - Event processing logic
- `/src/lib` - Shared utilities and helpers
- `/graphql` - GraphQL schema and operations
- `/generated` - Auto-generated GraphQL types

### Key Architectural Patterns

#### tRPC Router Pattern
All API endpoints use tRPC routers defined in `*.router.ts` files. Protected procedures require authentication via `protectedClientProcedure` (valid Saleor token).

#### Event-Driven Architecture
The app responds to Saleor events through webhooks:
- Order events (created, confirmed, cancelled, fulfilled, etc.)
- Invoice events
- Gift card events
Each event type has its own handler in `/src/pages/api/webhooks/`

#### SMTP Configuration Service
Located in `/src/modules/smtp/configuration/`, manages email templates and SMTP settings per event type. Configurations are stored in DynamoDB/APL.

#### Email Compilation Pipeline
1. HandlebarsTemplateCompiler - Process Handlebars variables
2. MjmlCompiler - Convert MJML to HTML
3. HtmlToTextCompiler - Generate text version
4. SmtpEmailSender - Send via Nodemailer

### Environment Configuration

The app supports multiple APL (Auth Persistence Layer) options:
- `file` - Local development (default)
- `upstash` - Production with Redis
- `dynamodb` - AWS DynamoDB
- `saleor-cloud` - Saleor Cloud APL

Set via `APL` environment variable in `.env` file.

### Testing Approach
- Unit tests use Vitest with mocked dependencies
- Tests are colocated with source files (`.test.ts`)
- Use `describe`, `it`, `expect` from Vitest
- Mock external services and APIs
- Tests run with shuffled order to prevent side effects

### Important Notes
- Always commit the `/generated` folder after GraphQL changes
- The app requires Saleor version >=3.11.7 <4
- Use ngrok for local webhook testing
- MJML templates support Handlebars variables for dynamic content
- All webhook handlers are in `/src/pages/api/webhooks/`
