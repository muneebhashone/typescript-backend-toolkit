---
description: Scaffold a seeder and factory for a module to populate test data
argument-hint: <module>/<Name>
allowed-tools: Bash, Read, Edit
model: claude-sonnet-4-5
---

# Create Seeder & Factory

Generate a factory and seeder for an existing module, register it, and optionally run it.

## Task

**Arguments:**
- `$1` (required): module/name path (e.g., `user/User`, `product/Product`)

Parse `$1` to extract:
- Module name: everything before `/`
- Entity name: everything after `/`

## Steps

1. **Generate factory and seeder files**

   Run both commands:
   ```bash
   pnpm tbk make:factory $1 && pnpm tbk make:seeder $1
   ```

   This creates:
   - `src/modules/{module}/factories/{name}.factory.ts` (exports camelCase factory)
   - `src/modules/{module}/seeders/{Name}Seeder.ts`

2. **Implement seeder logic**

   Read the generated seeder file and verify it:
   - Imports the correct factory
   - Imports the module's model
   - Has proper collection name in config
   - Uses factory.build() correctly

   If the seeder needs customization, ask the user about:
   - Number of records to generate (default: 10)
   - Any specific field overrides needed
   - Dependencies on other seeders

3. **Register seeder**

   Read `src/seeders/registry.ts` and add the new seeder to the array:
   - Import the seeder class
   - Add it to the `seeders` export array

4. **Run seeders**

   Ask the user if they want to run the seeder now.

   If yes, offer options:
   - Dry run first (recommended): `pnpm tbk seed --dry-run --only {Name}Seeder`
   - Run for real: `pnpm tbk seed --only {Name}Seeder`
   - Fresh run (drops collection): `pnpm tbk seed --fresh --only {Name}Seeder`

   Run the selected command.

## Verification

After completing all steps, verify:

1. Factory file exists with `build()` method
2. Seeder file exists with correct imports
3. Seeder registered in `src/seeders/registry.ts`
4. Dry run executes without errors
5. Actual seeding creates expected records (if run)

Report success with the seeder name and record count.

## Context

- Factories export `{camelName}Factory` with a `build(i, overrides)` method
- Seeders use `ctx.refs.set()` and `ctx.refs.get()` to share data between seeders
- MongoDB must be running before seeding (`docker compose up -d`)
