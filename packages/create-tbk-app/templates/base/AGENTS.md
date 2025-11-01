# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds runtime code: `app/` (Express setup), `modules/` (domain logic), `lib/` (DB, queues, email, storage), `routes/` (HTTP wiring).
- Shared helpers: `src/common/`, `src/utils/`, `src/observability/` — prefer reuse over new utilities.
- Assets: emails in `src/email/templates/`, static files in `public/`.
- Configuration: `src/config/` with environment schema in `src/config/env.ts`.

## Build, Test & Development Commands

- `docker compose up -d` — start MongoDB and Redis locally.
- `pnpm dev` — watch server and run the email previewer.
- `pnpm build` — compile TypeScript via `tsup` to `dist/`.
- `pnpm start` | `pnpm start:dev|:prod|:local` — run compiled or env-specific entry via `dotenv-cli`.
- `pnpm typecheck` — strict type checks without emit. `pnpm lint` | `pnpm lint:fix` — ESLint with Prettier.
- Useful: `pnpm openapi` (generate spec), `pnpm seed` (dev seed), `pnpm email:dev` (preview emails).

## Coding Style & Naming Conventions

- TypeScript, 2-space indentation, organized imports; prefer named exports from shared modules.
- Naming: camelCase (vars/functions), PascalCase (classes), kebab-case (feature files).
- Linting: ESLint + Prettier; avoid `any`, remove unused code before PRs.

## Testing Guidelines

- No test runner is configured yet. If adding tests, prefer colocated specs (`*.spec.ts`) near source or `__tests__/` under `src/`.
- Focus on unit tests for `modules/` and `utils/`; mock integrations from `lib/`.
- Aim for meaningful coverage on controllers, services, and schema validation. Keep tests fast and deterministic.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:` — one logical change per commit.
- PRs must describe problem, solution, and rollout (migrations, flags, ops). Link issues; include logs/screens for ops-facing changes.
- Document new env vars and update `.env.sample` and `src/config/env.ts` together.

## Security & Configuration Tips

- Never commit secrets. Source config from env; validate via `src/config/env.ts`.
- Protect admin surfaces (e.g., `/queues`, `/ops/*`) behind auth in production; document access controls when changing them.

