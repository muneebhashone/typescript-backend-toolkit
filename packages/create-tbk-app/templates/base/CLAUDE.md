# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript Backend Toolkit is a production-ready Express.js backend framework with a plugin-based architecture. It emphasizes type safety, auto-generated documentation, and developer productivity through an Artisan-like CLI.

## Common Commands

### Development
```bash
pnpm dev                 # Start dev server with hot reload + email preview
pnpm start:dev           # Start dev server only
pnpm build               # Compile TypeScript to dist/
pnpm start:prod          # Run production build
pnpm typecheck           # Type check without building
pnpm lint                # Run ESLint
pnpm lint:fix            # Auto-fix linting issues
```

### Testing & Debugging
```bash
pnpm email:dev           # Preview email templates (http://localhost:3001)
```

### CLI Tools (tbk)
```bash
pnpm tbk generate:module <name> [--path /api/v1]   # Generate complete module
pnpm tbk generate:plugin <name>                     # Generate plugin
pnpm tbk generate:middleware <name>                 # Generate middleware
pnpm tbk generate:factory <name>                    # Generate factory for model
pnpm tbk seed                                       # Run database seeders
```

### OpenAPI Documentation
```bash
pnpm tbk docs:openapi    # Generate OpenAPI spec (public/openapi.yml)
pnpm tbk docs:sdk        # Generate TypeScript SDK from OpenAPI spec

# Or use convenience aliases:
pnpm openapi             # Alias for tbk docs:openapi
pnpm gen-sdk             # Alias for tbk docs:sdk
```

Visit `http://localhost:3000/docs` for live Swagger UI.

## Critical Architecture Patterns

### MagicRouter System (NEVER use plain Express routing)

**All routes MUST use MagicRouter** - it auto-generates OpenAPI documentation from Zod schemas and provides typed responses.

```typescript
import MagicRouter from '@/plugins/magic/router';
import { canAccess } from '@/middlewares/can-access';

const router = new MagicRouter('/api/users');

// Every route needs: path, config object, ...handlers
router.post(
  '/create',
  {
    requestType: { body: createUserSchema },
    responses: { 201: createUserResponseSchema },
  },
  canAccess(),  // Middleware (optional)
  handleCreate, // Controller (last handler)
);

export default router.getRouter();  // MUST call .getRouter()
```

**Key points:**
- Second argument is ALWAYS a config object (use `{}` if no validation)
- Last handler is the controller, preceding ones are middleware
- Never use Express's `app.get()` or `router.get()` directly
- Always define response schemas in `*.schema.ts` files using `R.success()` / `R.paginated()`

### Module Structure

Every module follows this exact structure:

```
src/modules/<module-name>/
├── <module-name>.dto.ts        # Zod schemas and TypeScript types
├── <module-name>.model.ts      # Mongoose model
├── <module-name>.schema.ts     # Request/response validation schemas
├── <module-name>.services.ts   # Business logic and data access
├── <module-name>.controller.ts # HTTP request handlers
└── <module-name>.router.ts     # MagicRouter route definitions
```

**Responsibilities:**
- **DTOs**: Define input/output Zod schemas, export inferred types
- **Models**: Mongoose schemas, no business logic
- **Schemas**: Request validation (body/params/query) + response schemas with R builders
- **Services**: Framework-agnostic business logic, database operations
- **Controllers**: Thin HTTP handlers using `ResponseExtended<T>` for type-safe responses
- **Routers**: MagicRouter configuration with middleware

### Response Schema Pattern (CRITICAL)

**Always define response schemas in `*.schema.ts` files:**

```typescript
// In module.schema.ts
import { R } from '@/plugins/magic/response.builders';
import { itemOutSchema } from './module.dto';

export const createItemResponseSchema = R.success(itemOutSchema);
export const getItemsResponseSchema = R.paginated(itemOutSchema);

export type CreateItemResponseSchema = z.infer<typeof createItemResponseSchema>;
export type GetItemsResponseSchema = z.infer<typeof getItemsResponseSchema>;

// In module.router.ts
router.post('/', {
  requestType: { body: createItemSchema },
  responses: { 201: createItemResponseSchema },
}, canAccess(), handleCreate);

// In module.controller.ts
export const handleCreate = async (
  req: Request<unknown, unknown, CreateItemSchemaType>,
  res: ResponseExtended<CreateItemResponseSchema>,
) => {
  const item = await createItem(req.body);
  return res.created?.({
    success: true,
    message: 'Item created',
    data: item,
  });
};
```

**Response builders:**
- `R.success(schema)` - Standard envelope: `{ success, message?, data? }`
- `R.paginated(itemSchema)` - List with pagination: `{ success, message?, data: { items, paginator } }`
- `R.noContent()` - 204 empty response
- `R.error()` - Error envelope
- `R.raw(schema)` - Non-envelope response (healthchecks, etc.)

### Type-Safe Request/Response Pattern

```typescript
import type { Request } from 'express';
import type { ResponseExtended } from '@/types';
import type { CreateUserSchemaType, CreateUserResponseSchema } from './user.schema';

export const handleCreate = async (
  req: Request<ParamsType, unknown, BodyType, QueryType>,
  res: ResponseExtended<ResponseSchemaType>,
) => {
  // Request already validated by Zod middleware
  const data = req.body;
  const userId = req.user?.sub;  // JWT payload from canAccess()

  const result = await createUser(data);

  // Use typed response helpers
  return res.created?.({
    success: true,
    message: 'User created',
    data: result,
  });
};
```

**Available response helpers:** `res.ok?.()`, `res.created?.()`, `res.noContent?.()`, `res.notFound?.()`, `res.badRequest?.()`, `res.forbidden?.()`

### Plugin System

Plugins are registered in `src/app/app.ts` via the `createApp()` function. Each plugin implements the `ToolkitPlugin` interface:

```typescript
export interface ToolkitPlugin {
  name: string;
  priority?: number;  // Higher priority = registered first
  register(context: AppContext): Promise<void | string[]> | void | string[];
  onShutdown?: () => Promise<void>;
}
```

**Built-in plugins:**
- **observability** - Pino logger, metrics (Prometheus), request IDs
- **security** - Helmet, CORS, rate limiting
- **cache** - Redis/memory caching with middleware
- **magic** - MagicRouter, OpenAPI generation, response validation
- **lifecycle** - Graceful shutdown handling
- **auth** - JWT extraction and session management
- **admin** - Django-style admin panel (`/admin`)
- **realtime** - Socket.IO

Plugins can return an array of URLs to display on startup.

### Validation with Zod

**Always use Zod for validation, never Mongoose validators:**

```typescript
import { z } from 'zod';
import validator from 'validator';

export const createUserSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email' }),
  password: z.string({ required_error: 'Password is required' })
    .min(8)
    .max(64),
  userId: z.string()
    .refine((val) => validator.isMongoId(val), 'Invalid MongoDB ID'),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
```

**Key patterns:**
- Use `validator` package for MongoDB IDs, NOT regex
- Use `{ required_error: 'message' }` for required fields
- Query params need `.transform(Number)` for numeric values
- Export types with `z.infer<typeof schema>`

### Service Layer Pattern

Services are framework-agnostic and handle all business logic:

```typescript
// Services return data or throw errors
export const findById = async (id: string) => {
  const user = await UserModel.findById(id);
  return user;  // null if not found
};

export const create = async (data: CreateInput) => {
  const exists = await UserModel.findOne({ email: data.email });
  if (exists) {
    const error = new Error('User already exists') as any;
    error.statusCode = 400;
    throw error;
  }

  const user = await UserModel.create(data);
  logger.info('User created', { userId: user._id });
  return user;
};
```

**Guidelines:**
- Services throw errors with `statusCode` property for HTTP status codes
- Controllers decide how to handle null returns
- Never import Express types (Request/Response) in services
- Use logger from `@/plugins/logger`

### File Uploads with Formidable

The toolkit uses Formidable (not Multer) for file uploads:

```typescript
// In schema file
import { zFile, zFiles, MIME_GROUPS } from '@/plugins/magic/zod-extend';

export const uploadSchema = z.object({
  avatar: zFile({
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: MIME_GROUPS.IMAGES,
  }),
  documents: zFiles({
    maxSize: 2 * 1024 * 1024,
    allowedTypes: MIME_GROUPS.DOCUMENTS,
  }).optional(),
});

// In router
router.post('/upload', {
  requestType: { body: uploadSchema },
  contentType: 'multipart/form-data',
  multipart: true,
}, canAccess(), handleUpload);

// In controller - files are in req.body, NOT req.file/req.files
const file = req.body.avatar;  // Single file
const files = req.body.documents;  // Multiple files (optional)

// Upload to S3/R2
import { uploadFile } from '@/lib/storage';
const { url } = await uploadFile({ file, key: `uploads/${file.originalFilename}` });
```

### Authentication & JWT

JWT payload is available via `req.user` when using `canAccess()` middleware:

```typescript
import { canAccess } from '@/middlewares/can-access';

// In router
router.get('/me', {}, canAccess(), handleGetCurrentUser);

// In controller
const userId = req.user?.sub;         // User ID
const email = req.user?.email;        // Email (optional)
const role = req.user?.role;          // Role enum
const username = req.user?.username;  // Username

// JWT utils
import { signToken, verifyToken } from '@/utils/jwt.utils';
const token = await signToken({ sub: userId, email, username, role });
```

### Session Management

The toolkit includes a flexible session system:
- Session driver: MongoDB or Redis (configured via `SESSION_DRIVER` env var)
- Session rotation, idle/absolute TTLs, max sessions per user
- Automatic cleanup with configurable cron schedule
- Session debugging mode

Sessions are managed separately from JWT tokens. See `src/modules/auth/session/` for implementation.

### Environment Configuration

All config in `src/config/env.ts` validated with Zod. Time values are in milliseconds.

**Key variables:**
- `NODE_ENV` - `development` | `production` | `test`
- `SESSION_DRIVER` - `mongo` | `redis`
- `STORAGE_PROVIDER` - `s3` | `r2` | `local`
- `CACHE_PROVIDER` - `redis` | `memory`
- `RESPONSE_VALIDATION` - `strict` | `warn` | `off` (validates responses against schemas)

Always use `import config from '@/config/env'` - never access `process.env` directly.

### Creating a New Module

**ALWAYS use the CLI:**

```bash
pnpm tbk generate:module <name>
```

This scaffolds all 6 files following project patterns. After generation:

1. Customize the model with your fields and indexes
2. Update DTOs with Zod input/output schemas
3. Define request/response validation in schema file
4. Implement service functions (business logic)
5. Write thin controllers that delegate to services
6. Configure routes with MagicRouter (auth, validation)
7. Register router in `src/routes/routes.ts`

**Never create modules manually** - the CLI ensures consistency and catches common mistakes.

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` resolves to `./src/*`

Example: `import { logger } from '@/plugins/logger'`

### MongoDB ID Validation

**CRITICAL:** Always use `validator.isMongoId()`, NEVER regex:

```typescript
// ✅ CORRECT
import validator from 'validator';
z.string().refine((val) => validator.isMongoId(val), 'Invalid ID')

// ❌ WRONG - DO NOT USE REGEX
z.string().regex(/^[a-f\d]{24}$/i)
```

### Error Handling

Controllers can handle errors two ways:

**Option 1: Typed error responses (RECOMMENDED)**
```typescript
if (!item) {
  return res.notFound?.({ success: false, message: 'Not found' });
}
```

**Option 2: Let global error handler catch thrown errors**
```typescript
const error = new Error('Forbidden') as any;
error.statusCode = 403;
throw error;
```

Controllers don't need try-catch blocks - global error handler in `src/middlewares/error-handler.ts` catches everything.

### Background Jobs & Queues

Use BullMQ for background processing:

```typescript
import { emailQueue } from '@/queues/email.queue';

await emailQueue.add('sendWelcome', { email, name }, {
  delay: 5000,      // Optional delay in ms
  attempts: 3,      // Retry attempts
});
```

Queue dashboard available at `/queues` (protected by `QUEUE_AUTH_ENABLED`).

### Admin Panel

Django-style auto-generated admin UI at `/admin` (protected by `ADMIN_AUTH_ENABLED`).

Models are introspected and rendered with full CRUD. Configure admin access in `src/plugins/admin/registry.ts`.

### Important Files to Know

- `src/main.ts` - Application entry point, bootstraps server
- `src/app/app.ts` - Plugin registration and app initialization
- `src/routes/routes.ts` - Main API router registration
- `src/config/env.ts` - Environment configuration with Zod validation
- `src/lib/database.ts` - MongoDB connection management
- `src/lib/cache.ts` - Redis/memory cache client
- `src/lib/storage.ts` - S3/R2/local file storage
- `src/lib/queue.ts` - BullMQ queue configuration
- `src/email/email.service.ts` - Email sending (SMTP/Resend/Mailgun)
- `src/plugins/magic/router.ts` - MagicRouter implementation
- `src/plugins/magic/response.builders.ts` - Response schema builders (R.success, etc.)
- `src/middlewares/can-access.ts` - JWT authentication middleware
- `src/middlewares/error-handler.ts` - Global error handler
- `src/utils/` - Pure utility functions (JWT, passwords, pagination, etc.)

### Common Mistakes to Avoid

1. ❌ Using plain Express routing instead of MagicRouter
2. ❌ Forgetting to call `.getRouter()` when exporting router
3. ❌ Not providing config object as 2nd argument to MagicRouter methods
4. ❌ Defining response schemas inline instead of in `*.schema.ts`
5. ❌ Using `res.status().json()` instead of `ResponseExtended` helpers
6. ❌ Using regex for MongoDB IDs instead of `validator.isMongoId()`
7. ❌ Importing Express types in service files
8. ❌ Putting business logic in controllers instead of services
9. ❌ Creating modules manually instead of using `pnpm tbk generate:module`
10. ❌ Accessing `process.env` directly instead of using `config`
11. ❌ Using `req.file`/`req.files` instead of `req.body` for Formidable uploads
12. ❌ Forgetting to register new routers in `src/routes/routes.ts`

### Package Manager

**ALWAYS use `pnpm`** - never npm or yarn. The project uses `pnpm`.

