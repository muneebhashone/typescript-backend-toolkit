### Create a new module (tbk CLI)

- **Purpose**: Scaffold a fully-typed module and wire it into routing.

#### Inputs

- **moduleName**: module folder/name in `src/modules/` (e.g., `product`)
- **apiPath**: optional API root path; defaults to `/api` (e.g., `/api/v1`)

#### Run

```bash
pnpm tbk generate:module <moduleName> --path <apiPath>
# examples
# pnpm tbk generate:module product --path /api
# pnpm tbk generate:module product --path /api/v1
```

This generates:

- `src/modules/<moduleName>/<moduleName>.dto.ts`
- `src/modules/<moduleName>/<moduleName>.model.ts`
- `src/modules/<moduleName>/<moduleName>.schema.ts`
- `src/modules/<moduleName>/<moduleName>.services.ts`
- `src/modules/<moduleName>/<moduleName>.controller.ts`
- `src/modules/<moduleName>/<moduleName>.router.ts` (exports `<MODULE>_ROUTER_ROOT` and default router)

#### Register router (required)

Add an import and `router.use(...)` in `src/routes/routes.ts`:

```ts
// add with other imports
import <moduleName>Router, { <MODULE_NAME>_ROUTER_ROOT } from '../modules/<moduleName>/<moduleName>.router';

// add with other router.use calls
router.use(<MODULE_NAME>_ROUTER_ROOT, <moduleName>Router);
```

- Replace `<moduleName>` with your actual module name (e.g., `product`).
- Replace `<MODULE_NAME>` with the uppercased module name (e.g., `PRODUCT`).

Example for `product`:

```ts
import productRouter, {
  PRODUCT_ROUTER_ROOT,
} from '../modules/product/product.router';
router.use(PRODUCT_ROUTER_ROOT, productRouter);
```

#### Post-steps

1. Rebuild OpenAPI (auto-generates Swagger from MagicRouter + Zod)

```bash
pnpm openapi
```

2. Typecheck and lint

```bash
pnpm typecheck && pnpm lint
```

3. Optional: create a seeder and factory

```bash
pnpm tbk make:seeder <moduleName>/<Name>
pnpm tbk make:factory <moduleName>/<Name>
```

#### Notes

- Routes must use `MagicRouter`; the generator already sets this up and defines `<MODULE>_ROUTER_ROOT` using the `--path` you pass.
- Keep environment configs valid, and update `src/config/env.ts` and `.env.sample` if you introduce new variables.
- Commit with Conventional Commits (e.g., `feat(<moduleName>): add <feature>`).
