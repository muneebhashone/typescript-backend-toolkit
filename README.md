<p align="center">
  <img src="logo.png" width="200px" align="center" alt="TypeScript Backend Toolkit logo" />
  <h1 align="center">TypeScript Backend Toolkit</h1>
  <p align="center">
    <br/>
    <strong>Developer‑first backend toolkit</strong><br/>
    Simple for beginners, productive for experts — and structured so tools (including AI agents) can follow it without guesswork.<br/>
    Predictable architecture. Type‑safe patterns. Plugin‑based. Production‑ready.
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> •
    <a href="#features">Features</a> •
    <a href="#cli">CLI</a> •
    <a href="#architecture">Architecture</a> •
    <a href="docs/">Documentation</a>
  </p>
</p>
<br/>

## Prerequisites

Before you get started, make sure you have the following installed on your machine:

- **Docker + Docker Compose**
- **PNPM**
- **Node.js 20+ (LTS)**

## Quick Start

### Option 1: Scaffold a New Project (Recommended)

Use the CLI scaffolder to create a new project with only the features you need:

```bash
# Interactive mode (recommended)
npx create-tbk-app my-backend-api

# Or with a preset
npx create-tbk-app my-api --preset=standard

# Then start developing
cd my-api
pnpm dev
```

See [create-tbk-app README](packages/create-tbk-app/README.md) for all options and presets.

### Option 2: Clone the Full Toolkit

```bash
# 1. Clone and setup
git clone <repository>
cd typescript-backend-toolkit

# 2. Start services
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Configure environment
cp .env.sample .env.development
# Edit .env.development with your settings

# 5. (Optional) Generate your first module
pnpm tbk generate:module user --path /api/v1

# 6. Start development server
pnpm dev
```

**Visit `http://localhost:3000/docs`** for your auto-generated API documentation.

## Features

- **Auto‑generated Admin Dashboard (Django‑style)** — Manage data and ops out of the box.
- **Auto‑generated OpenAPI docs (FastAPI‑style)** — Live docs at `/docs`, always in sync.
- **Plugin‑based system** — Add capabilities (auth, realtime, admin, queues) as plugins.
- **First‑class CLI (Artisan‑like)** — Generate modules, plugins, and seeders with consistent, type‑safe patterns.
- **Production‑ready stack** — Zod validation, JWT auth, file uploads, queues, emails, and more.

### Works great with AI agents (optional)
The project is intentionally structured so almost any AI coding agent can work reliably: predictable files, clear schemas, and consistent codegen. Use AI tools if you like—or ignore them and build normally.

## CLI

The `tbk` command‑line tool is productivity‑focused, similar to Laravel’s Artisan. It helps you scaffold features and run common tasks quickly and consistently.

```bash
# Scaffold features fast (Artisan‑like)
pnpm tbk g:module user --path /api/v1
pnpm tbk g:plugin admin
pnpm tbk seed

# Discover commands
pnpm tbk --help
pnpm tbk g:module --help
```

## Architecture

### At a glance
```
src/
├── app/           # Application setup and plugin registration
├── modules/       # Domain logic (users, products, payments)
├── plugins/       # Extensible features (auth, realtime, admin)
├── lib/           # Infrastructure clients (database, storage, email)
├── utils/         # Pure functions (JWT, passwords, pagination)
├── config/        # Type-safe environment configuration
└── routes/        # HTTP wiring with MagicRouter
```

Each folder has one job:
- `app/` boots the server and wires plugins.
- `modules/` holds your business logic and schemas.
- `plugins/` adds features without touching core code.
- `lib/` connects to infra (DB, queues, email, storage).
- `utils/` contains small, pure helpers.
- `config/` validates environment variables.
- `routes/` declares HTTP endpoints.

Core capabilities included:
- **OpenAPI docs** at `/docs`
- **Auth** (Google Sign‑In + JWT sessions)
- **Users & Roles** (CRUD, RBAC)
- **File Uploads** (S3/R2/Local, multipart)
- **Validation** (Zod, end‑to‑end)
- **Queues** (BullMQ + BullBoard)
- **Realtime** (Socket.IO)
- **Realtime Tester** (UI to send/receive events and inspect channels)
- **Admin Panel** (separate auth)
- **Emails** (transactional templates)

## Documentation

- **[CLI Commands](docs/docs/guides/cli-commands)**
- **[Creating Modules](docs/docs/guides/creating-modules)**  
- **[MagicRouter](docs/docs/guides/magic-router)**
- **[Environment Config](docs/docs/guides/environment-config)**
- **[Testing & Debugging](docs/docs/guides/testing-debugging)**

## Development Commands

```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Compile to dist/
pnpm start            # Run production build
pnpm typecheck        # Type checking
pnpm lint             # ESLint + Prettier

# CLI Tools  
pnpm tbk g:module <name>   # Generate complete module
pnpm tbk g:plugin <name>   # Generate plugin
pnpm tbk seed              # Run database seeders
pnpm tbk docs:openapi      # Generate OpenAPI spec
pnpm tbk docs:sdk          # Generate TypeScript SDK

# Other Tools
pnpm email:dev        # Preview email templates
```

## Production Deployment

```bash
# Build for production
pnpm build

# Set production environment
cp .env.production .env

# Start production server
pnpm start:prod
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built to make backend development effortless**
