---
description: Scaffold a fully-typed module with controller, service, router, schema, and model files
argument-hint: <moduleName> [--path <apiPath>]
allowed-tools: Bash, Read, Edit
model: claude-sonnet-4-5
---

# Create Module

Generate a complete module with all required files and wire it into the application.

## Task

**Arguments:**
- `$1` (required): module name (e.g., `product`, `payment`)
- `$2` (optional): API path flag `--path`
- `$3` (optional): API path value (e.g., `/api/v1`); defaults to `/api`

**Module Name:** `$1`

1. **Generate module files**

   Run the generator command:
   ```bash
   pnpm tbk generate:module $1 $2 $3
   ```

   This creates:

   - `src/modules/<moduleName>/<moduleName>.dto.ts`
   - `src/modules/<moduleName>/<moduleName>.model.ts`
   - `src/modules/<moduleName>/<moduleName>.schema.ts`
   - `src/modules/<moduleName>/<moduleName>.services.ts`
   - `src/modules/<moduleName>/<moduleName>.controller.ts`
   - `src/modules/<moduleName>/<moduleName>.router.ts` (exports `<MODULE>_ROUTER_ROOT` and default router)

2. **Register router in routes**

   Read `src/routes/routes.ts` and add the router registration:

   - Add import at top with other module imports
   - Add `router.use()` call with other registrations
   - Use camelCase for router variable name
   - Use UPPER_SNAKE_CASE for the router root constant

3. **Rebuild OpenAPI documentation**

   ```bash
   pnpm openapi
   ```

   Auto-generates Swagger from MagicRouter + Zod schemas.

4. **Typecheck and lint**

   ```bash
   pnpm typecheck && pnpm lint
   ```

5. **Register with admin dashboard** (optional)

   Ask the user if they want to add this module to the admin panel.

   If yes, read and edit `src/plugins/admin/registry.ts` to add the resource.

6. **Optional: Create seeder and factory**

   Ask the user if they need test data generation for this module.

   If yes, run:
   ```bash
   pnpm tbk make:factory $1/$(echo $1 | sed 's/.*/\u&/')
   pnpm tbk make:seeder $1/$(echo $1 | sed 's/.*/\u&/')
   ```

## Verification

After completing all steps, verify:

1. Module files exist in `src/modules/$1/`
2. Router is registered in `src/routes/routes.ts`
3. OpenAPI spec regenerated successfully
4. No type errors or lint warnings
5. Admin panel configured (if requested)

Report success with the module name and available endpoints.

## Context

- All routes use MagicRouter (NOT plain Express)
- Response schemas use `R.success()`, `R.paginated()`, `R.error()` builders
- Controllers use `ResponseExtended<T>` for type-safe responses
- Update `src/config/env.ts` and `.env.sample` if new env vars are needed
