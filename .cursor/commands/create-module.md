# Create a new module (tbk CLI)

## Overview

Scaffold a fully-typed module with controller, service, router, schema, and model files, then wire it into the application routing system.

## Inputs

- **moduleName**: module folder/name in `src/modules/` (e.g., `product`)
- **apiPath**: optional API root path; defaults to `/api` (e.g., `/api/v1`)

## Steps

1. **Generate module files**

   ```bash
   pnpm tbk generate:module <moduleName> --path <apiPath>
   ```

   Examples:

   ```bash
   pnpm tbk generate:module product --path /api
   pnpm tbk generate:module product --path /api/v1
   ```

   This creates:

   - `src/modules/<moduleName>/<moduleName>.dto.ts`
   - `src/modules/<moduleName>/<moduleName>.model.ts`
   - `src/modules/<moduleName>/<moduleName>.schema.ts`
   - `src/modules/<moduleName>/<moduleName>.services.ts`
   - `src/modules/<moduleName>/<moduleName>.controller.ts`
   - `src/modules/<moduleName>/<moduleName>.router.ts` (exports `<MODULE>_ROUTER_ROOT` and default router)

2. **Register router in routes**
   Add an import and `router.use(...)` in `src/routes/routes.ts`:

   ```ts
   // add with other imports
   import <moduleName>Router, { <MODULE_NAME>_ROUTER_ROOT } from '../modules/<moduleName>/<moduleName>.router';

   // add with other router.use calls
   router.use(<MODULE_NAME>_ROUTER_ROOT, <moduleName>Router);
   ```

   - Replace `<moduleName>` with your actual module name (e.g., `product`)
   - Replace `<MODULE_NAME>` with the uppercased module name (e.g., `PRODUCT`)

   Example for `product`:

   ```ts
   import productRouter, {
     PRODUCT_ROUTER_ROOT,
   } from '../modules/product/product.router';
   router.use(PRODUCT_ROUTER_ROOT, productRouter);
   ```

3. **Rebuild OpenAPI documentation**

   ```bash
   pnpm openapi
   ```

   Auto-generates Swagger from MagicRouter + Zod schemas.

4. **Typecheck and lint**

   ```bash
   pnpm typecheck && pnpm lint
   ```

5. **Register with admin dashboard** (if needed)

   Add your module to `src/admin/registry.ts`:

   ```ts
   import <ModuleName>Model from '../modules/<moduleName>/<moduleName>.model';

   export const adminResources: AdminResource[] = [
     // ... existing resources
     {
       name: '<moduleName>s',
       label: '<ModuleName>s',
       model: <ModuleName>Model,
       readOnlyFields: ['_id', 'createdAt', 'updatedAt']
     },
   ];
   ```

   - Replace `<moduleName>` with your module name (e.g., `product`)
   - Replace `<ModuleName>` with PascalCase version (e.g., `Product`)
   - Adjust `readOnlyFields` as needed for your module

6. **Optional: Create seeder and factory**
   ```bash
   pnpm tbk make:factory <moduleName>/<Name>
   pnpm tbk make:seeder <moduleName>/<Name>
   ```

## Module Checklist

- [ ] Module files generated successfully
- [ ] Router registered in `src/routes/routes.ts`
- [ ] Module registered in admin dashboard (`src/admin/registry.ts`) (if needed)
- [ ] OpenAPI documentation rebuilt
- [ ] Code passes typecheck and lint
- [ ] Environment variables added to `src/config/env.ts` and `.env.sample` (if needed)
- [ ] Committed with Conventional Commits format

## Response Validation

Generated modules automatically use the **response validation system**:

- **Response schemas** defined with `R.success()`, `R.paginated()`, `R.error()` helpers
- **Typed response helpers** (`res.ok()`, `res.created()`, `res.noContent()`) in controllers
- **OpenAPI documentation** includes accurate per-status response schemas
- **Runtime validation** ensures responses match schemas (configurable via `RESPONSE_VALIDATION` env var)

### Example from generated code:

**Router:**

```typescript
import { R } from '../../openapi/response.builders';

router.get(
  '/',
  {
    requestType: { query: getItemsSchema },
    responses: {
      200: R.paginated(itemOutSchema),
    },
  },
  canAccess(),
  handleGetItems,
);
```

**Controller:**

```typescript
import type { ResponseExtended } from '../../types';

export const handleGetItems = async (req, res: ResponseExtended) => {
  const { results, paginatorInfo } = await getItems(req.query);
  return res.ok?.({
    success: true,
    data: { items: results, paginator: paginatorInfo },
  });
};
```

## Notes

- Routes must use `MagicRouter`; the generator already sets this up and defines `<MODULE>_ROUTER_ROOT` using the `--path` you pass
- Generated code uses **new response validation pattern** - see `docs/RESPONSE_VALIDATION.md` for details
- Legacy `successResponse()` still works but new pattern is recommended
- Keep environment configs valid, and update `src/config/env.ts` and `.env.sample` if you introduce new variables
- Commit with Conventional Commits (e.g., `feat(<moduleName>): add <feature>`)
