# create-tbk-app

CLI tool to scaffold TypeScript Backend Toolkit projects with customizable features.

## Quick Start

```bash
# Interactive mode (recommended)
npx create-tbk-app my-backend-api

# With preset
npx create-tbk-app my-api --preset=standard

# Custom configuration via flags
npx create-tbk-app my-api --auth=jwt --cache=redis --email=resend
```

## Features

- **Interactive CLI** - Guided setup with smart questions
- **Multiple Presets** - Minimal, Standard, or Full-featured configurations
- **Customizable** - Pick only the features you need
- **Type-safe** - Full TypeScript support throughout
- **Production-ready** - Best practices and security built-in

## Available Presets

### Minimal
Bare-bones API with core features only:
- Express + TypeScript
- MongoDB (Mongoose)
- MagicRouter (auto-generated OpenAPI docs)
- Basic logging

**Use case:** Simple APIs, microservices, learning projects

### Standard
Production-ready REST API:
- Everything in Minimal
- JWT Authentication
- Security hardening (Helmet, CORS, rate limiting)
- Memory caching
- Full observability (logging, metrics, health checks)

**Use case:** Most production APIs, SaaS backends

### Full-Featured
Complete backend with all features:
- Everything in Standard
- JWT + Session management (Redis)
- Redis caching
- Background jobs (BullMQ)
- File storage (S3/R2)
- Email sending (Resend/Mailgun/SMTP)
- Real-time (Socket.IO)
- Admin panel
- Queue dashboard

**Use case:** Complex applications, enterprise backends

## CLI Options

```bash
create-tbk-app [project-name] [options]

Options:
  --preset <type>           Preset configuration (minimal, standard, full, custom)
  --auth <type>             Authentication (none, jwt, jwt-sessions)
  --cache <provider>        Cache provider (none, memory, redis)
  --storage <provider>      Storage provider (none, local, s3, r2)
  --email <provider>        Email provider (none, resend, mailgun, smtp)
  --queues                  Enable background jobs
  --realtime                Enable real-time features
  --admin                   Include admin panel
  --pm <manager>            Package manager (pnpm, npm, yarn)
  --skip-git                Skip git initialization
  --skip-install            Skip dependency installation
  -h, --help                Display help
  -V, --version             Display version
```

## Usage Examples

### Interactive Mode (Recommended)

```bash
npx create-tbk-app
```

You'll be prompted for:
1. Project name
2. Preset selection
3. Custom features (if preset is "custom")
4. Package manager preference
5. Git/install preferences

### Non-Interactive Mode

**Using presets:**
```bash
# Minimal setup
npx create-tbk-app my-api --preset=minimal

# Standard with npm
npx create-tbk-app my-api --preset=standard --pm=npm

# Full-featured
npx create-tbk-app my-api --preset=full
```

**Custom configuration:**
```bash
# API with auth and caching
npx create-tbk-app my-api \
  --auth=jwt \
  --cache=redis \
  --pm=pnpm

# Full custom
npx create-tbk-app my-api \
  --auth=jwt-sessions \
  --cache=redis \
  --queues \
  --storage=s3 \
  --email=resend \
  --realtime \
  --admin
```

**Skip options:**
```bash
# Don't install dependencies or init git
npx create-tbk-app my-api --preset=standard --skip-install --skip-git
```

## What Gets Generated

### Core Files (Always)
```
my-api/
├── src/
│   ├── app/              # Application setup & plugin registration
│   ├── config/           # Environment configuration (Zod-validated)
│   ├── lib/              # Core libraries (database, etc.)
│   ├── middlewares/      # Express middlewares
│   ├── modules/          # Feature modules
│   ├── plugins/          # Plugin system
│   ├── routes/           # Route registration
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── main.ts           # Entry point
├── bin/                  # CLI tool (tbk)
├── public/               # Static assets
├── .env.example          # Environment variables template
├── .gitignore
├── package.json          # With selected dependencies
├── tsconfig.json
├── build.ts
└── README.md             # Custom README with setup instructions
```

### Conditional Files

Based on your selections:
- **Auth:** `src/modules/auth/`, `src/modules/user/`, auth middleware
- **Cache:** `src/lib/cache.ts`, cache plugin
- **Queues:** `src/lib/queue.ts`, `src/queues/`
- **Storage:** `src/lib/storage.ts`
- **Email:** `src/lib/email.ts`, `src/email/templates/`
- **Realtime:** `src/plugins/realtime/`
- **Admin:** `src/plugins/admin/`

## After Generation

### 1. Navigate to Project
```bash
cd my-api
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env.development

# Edit with your configuration
# Update MongoDB URL, JWT secret, API keys, etc.
```

### 3. Start Development
```bash
pnpm dev
```

### 4. Access Services

- **API Documentation:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/ops/health (if observability enabled)
- **Admin Panel:** http://localhost:3000/admin (if admin enabled)
- **Queue Dashboard:** http://localhost:3000/queues (if queues enabled)

## Generated Project Commands

```bash
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm start:prod       # Run production build
pnpm typecheck        # Type check without building
pnpm lint             # Run ESLint
pnpm openapi          # Generate OpenAPI spec

# CLI tool (module generation)
pnpm tbk generate:module <name>        # Generate CRUD module
pnpm tbk generate:plugin <name>        # Generate plugin
pnpm tbk generate:middleware <name>    # Generate middleware
```

## Feature Details

### Authentication
- **JWT:** Stateless token-based authentication
- **JWT + Sessions:** Token auth with server-side session management
- Session drivers: MongoDB or Redis
- Password hashing with Argon2
- Passport.js integration

### Caching
- **Memory:** In-memory cache (development/testing)
- **Redis:** Production-grade distributed cache
- Tag-based invalidation
- Middleware for route caching

### Background Jobs
- BullMQ queue system
- Redis-backed job storage
- Retry logic and error handling
- Optional monitoring dashboard

### File Storage
- **Local:** Store files on disk
- **S3:** Amazon S3 storage
- **R2:** Cloudflare R2 (S3-compatible)
- Formidable for file uploads

### Email
- **Resend:** Modern email API
- **Mailgun:** Transactional email service
- **SMTP:** Traditional SMTP server
- React Email for templates

### Real-time
- Socket.IO server
- Testing UI included
- CORS configuration

### Admin Panel
- Django-style auto-generated UI
- Model introspection
- Full CRUD operations
- Protected with authentication

### Observability
- **Basic:** Structured logging (Pino)
- **Full:** Logging + Prometheus metrics + Health checks

## Architecture

### Plugin System
All features are implemented as plugins that can be enabled/disabled:

```typescript
// src/app/app.ts
const plugins = [
  basicParserPlugin(),
  securityPlugin(),       // If enabled
  observabilityPlugin(),
  authPlugin(),           // If enabled
  realtimePlugin(),       // If enabled
  magicPlugin(),
  lifecyclePlugin(),
];
```

### Module Structure
Each feature module follows a consistent 6-file pattern:
- `*.dto.ts` - Zod schemas & types
- `*.model.ts` - Mongoose model
- `*.schema.ts` - Request/response validation
- `*.services.ts` - Business logic
- `*.controller.ts` - HTTP handlers
- `*.router.ts` - MagicRouter setup

### MagicRouter
Auto-generates OpenAPI documentation from Zod schemas:

```typescript
router.post('/users', {
  requestType: { body: createUserSchema },
  responses: { 201: createUserResponseSchema },
}, canAccess(), handleCreate);
```

## Requirements

- **Node.js:** >= 18.0.0
- **MongoDB:** Any version compatible with Mongoose 8.x
- **Redis:** Required for queues or Redis cache/sessions

## Development Status

**Current Version:** 0.1.0 (Alpha)

### ✅ Completed
- CLI implementation with Commander
- Interactive prompts with Inquirer
- Preset configurations (minimal, standard, full)
- Dependency resolver
- Template engine with Handlebars
- Configuration file generation (package.json, .env, README)
- Package manager support (pnpm, npm, yarn)
- Git initialization
- Non-interactive mode with flags

### 🚧 In Progress
- Template extraction from main toolkit
- Complete file copying and rendering
- Plugin-specific templates
- Module templates

### 📋 Planned
- Testing suite
- Template validation
- CI/CD examples
- Docker support
- Deployment guides

## Template Extraction (Next Phase)

The next development phase involves extracting all files from the main toolkit into templates:

1. **Base templates** (`templates/base/`)
   - Core application files
   - Build configuration
   - TypeScript config

2. **Plugin templates** (`templates/plugins/`)
   - One directory per plugin
   - Handlebars variables for customization

3. **Module templates** (`templates/modules/`)
   - Auth module
   - User module
   - Health check module

4. **Library templates** (`templates/lib/`)
   - Cache, queue, storage, email services

## Contributing

This is part of the TypeScript Backend Toolkit monorepo. See the main project for contribution guidelines.

## Troubleshooting

### "Invalid project name"
- Use lowercase letters, numbers, hyphens, and underscores only
- Must be a valid npm package name

### "Directory already exists"
- Choose a different project name
- Or delete/rename the existing directory

### Dependencies fail to install
- Ensure you have Node.js >= 18.0.0
- Try a different package manager with `--pm` flag
- Check your network connection

### Import errors after generation
- Currently in development - template extraction pending
- Follow the SETUP_NOTICE.md in generated project
- Manually copy files from main toolkit

## License

MIT

## Links

- [Main Toolkit Repository](#)
- [Documentation](#)
- [Report Issues](#)
