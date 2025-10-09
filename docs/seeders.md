Seeding System

- Location
  - Orchestrator: `src/seeders/DatabaseSeeder.ts`
  - Engine: `src/seeders/runner.ts`, `src/seeders/types.ts`
  - Module seeders: `src/modules/<module>/seeders/*.ts`
  - Factories: `src/modules/<module>/factories/*.factory.ts`

- Run
  - `pnpm seed -- --group dev` (development)
  - `pnpm tbk seed --group base` (via CLI)
  - Options:
    - `--group <base|dev|test|demo>`
    - `--only <Comma,Separated,Names>`
    - `--fresh` (drop involved collections) + `--force` for prod
    - `--dry-run`
    - `--no-transaction`

- Writing a Seeder
  - Export a `Seeder` with:
    - `name`: unique name
    - `groups`: which profiles include it
    - `dependsOn`: other seeders that must run first
    - `collections`: collections this seeder writes (enables `--fresh`)
    - `run(ctx)`: seeding logic; prefer idempotent upserts

- Relations
  - Use `ctx.refs.set/get` to share identifiers across seeders.
  - Declare `dependsOn` and the engine will order them.

- Factories
  - Place under `src/modules/<module>/factories/`
  - Provide `build` (plain object) and `create` (persisted) helpers.

- Safety
  - Production runs are blocked unless `--force` is provided.
  - Use `--dry-run` to preview actions.

