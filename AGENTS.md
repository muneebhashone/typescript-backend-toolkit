# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the runtime code: `app/` for Express setup, `modules/` for domain logic, `lib/` for integrations (database, queues, email), and `routes/` for HTTP wiring.
- Shared utilities live under `src/common/`, `src/utils/`, and `src/observability/`; reuse these helpers before creating new ones to maintain consistency.
- Email assets sit in `src/email/templates/` and static assets under `public/`; align template updates with backend releases.
- Configuration sources reside in `src/config/` with environment schemas; update these alongside any new `.env` keys.

## Build, Test & Development Commands

- `docker compose up -d` launches MongoDB and Redis locally; run it before starting the app.
- `pnpm dev` runs the backend watcher and email preview server concurrently for day-to-day development.
- `pnpm build` compiles TypeScript via `tsup` into `dist/`, and `pnpm start` executes the resulting bundle.
- `pnpm start:dev`, `pnpm start:prod`, and `pnpm start:local` boot the server against the matching `.env` file through `dotenv-cli`.
- `pnpm typecheck` and `pnpm lint` (or `pnpm lint:fix`) gate contributions by catching type and style regressions.

## Coding Style & Naming Conventions

- Stick to TypeScript with 2-space indentation; follow existing import ordering and prefer named exports from shared modules.
- Use camelCase for variables/functions, PascalCase for classes, and kebab-case for file names within feature folders.
- Run ESLint before submitting; lint rules warn on `any`, enforce unused-variable cleanup, and integrate with Prettier formatting defaults.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`) as reflected in recent history; scope messages to a single change.
- Each PR should describe the problem, the solution, and rollout notes (migrations, feature flags, or ops steps) in the opening comment.
- Link relevant issues, include screenshots or logs for ops-facing changes, and mention required env vars when introducing configuration.

## Security & Configuration Tips

- Never commit secrets; derive new keys in `.env.sample` and validate them in `src/config/env`.
- Keep admin surfaces (`/admin/queues`, `/ops/*`) behind authentication in production deployments and document access controls when altering them.
