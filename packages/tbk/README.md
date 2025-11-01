# @themuneebh-oss/tbk

CLI tool for TypeScript Backend Toolkit projects. Generate modules, plugins, middleware, seeders, and factories with a single command.

## Installation

This package is typically installed as a dev dependency in TypeScript Backend Toolkit projects:

```bash
pnpm add -D @themuneebh-oss/tbk
```

Or via npm:

```bash
npm install -D @themuneebh-oss/tbk
```

## Usage

After installation, use the `tbk` command:

```bash
# Generate a complete module
pnpm tbk generate:module <name> [--path /api/v1]

# Generate a plugin
pnpm tbk generate:plugin <name>

# Generate middleware
pnpm tbk generate:middleware <name>

# Run database seeders
pnpm tbk seed [--group dev] [--only SeederName] [--fresh]

# Create a seeder for a module
pnpm tbk make:seeder <module>/<name> [--count 5] [--unique field]

# Create a factory for a module
pnpm tbk make:factory <module>/<name> [--model ExportName]
```

## Commands

### generate:module

Generate a complete module with all files (dto, model, schema, services, controller, router).

```bash
pnpm tbk generate:module user
pnpm tbk generate:module product --path /api/v1
```

**Options:**

- `-p, --path <path>` - API path prefix (default: `/api`)

**Creates:**

- `src/modules/<name>/<name>.dto.ts` - Zod schemas and TypeScript types
- `src/modules/<name>/<name>.model.ts` - Mongoose model
- `src/modules/<name>/<name>.schema.ts` - Request/response validation schemas
- `src/modules/<name>/<name>.services.ts` - Business logic and data access
- `src/modules/<name>/<name>.controller.ts` - HTTP request handlers
- `src/modules/<name>/<name>.router.ts` - MagicRouter route definitions

### generate:plugin

Generate a new plugin with the standard structure.

```bash
pnpm tbk generate:plugin cache
```

**Creates:**

- `src/plugins/<name>/index.ts` - Plugin factory and registration

### generate:middleware

Generate a new Express middleware.

```bash
pnpm tbk generate:middleware rateLimiter
```

**Creates:**

- `src/middlewares/<name>.ts` - Middleware function

### seed

Run database seeders to populate test data.

```bash
# Run all seeders in dev group
pnpm tbk seed

# Run specific seeders
pnpm tbk seed --only UserSeeder,ProductSeeder

# Fresh run (drops collections)
pnpm tbk seed --fresh

# Dry run (no writes)
pnpm tbk seed --dry-run

# Force run in production
pnpm tbk seed --force
```

**Options:**

- `-g, --group <group>` - Group to run (base|dev|test|demo) (default: `dev`)
- `--only <names>` - Comma-separated seeder names
- `--fresh` - Drop involved collections before seeding
- `--force` - Force run in production
- `--dry-run` - Do not write, only log actions
- `--seed <number>` - Random seed for data generation (default: `1`)
- `--no-transaction` - Disable transactions

### make:seeder

Scaffold a new seeder for a module. Automatically detects model fields and dependencies.

```bash
pnpm tbk make:seeder user/User
pnpm tbk make:seeder product/Product --count 10 --unique slug
```

**Options:**

- `-c, --count <number>` - Default count for dev/test (default: `5`)
- `-u, --unique <field>` - Unique field to upsert by
- `-d, --depends-on <names>` - Comma-separated additional dependencies
- `--model <export>` - Model export name when not default

**Creates:**

- `src/modules/<module>/seeders/<Name>Seeder.ts`

**Note:** The seeder must be manually registered in `src/seeders/registry.ts`.

### make:factory

Scaffold a new factory for a module. Automatically detects model fields and create functions.

```bash
pnpm tbk make:factory user/User
pnpm tbk make:factory product/Product --model ProductModel --use service
```

**Options:**

- `--model <export>` - Model export name when not default
- `--use <service|model>` - Prefer using service create function when present (default: `service`)
- `--id-type <string|objectId>` - Hint for \_id type when ambiguous

**Creates:**

- `src/modules/<module>/factories/<name>.factory.ts`

## Requirements

- Node.js >= 18.0.0
- TypeScript Backend Toolkit project structure
- MongoDB connection (for seed command)

## How It Works

The CLI tool uses dynamic imports and model introspection to:

- Analyze Mongoose schemas to detect fields, types, and relationships
- Generate type-safe code following project patterns
- Ensure consistency with existing codebase structure

## Development

```bash
# Build the package
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

MIT

## Links

- [Main Toolkit Repository](https://github.com/muneebhashone/typescript-backend-toolkit)
- [Report Issues](https://github.com/muneebhashone/typescript-backend-toolkit/issues)
