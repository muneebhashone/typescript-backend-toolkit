# test-minimal

Backend API generated with **create-tbk-app** using the **minimal** preset.

## Features

- TypeScript + Express.js
- MongoDB with Mongoose
- Auto-generated OpenAPI documentation
- Type-safe routing with MagicRouter

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.development
```

3. Update `.env.development` with your configuration

4. Start development server:

```bash
pnpm dev
```

## Available Commands

```bash
pnpm dev           # Start dev server with hot reload
pnpm build         # Build for production
pnpm start:prod    # Run production build
pnpm typecheck     # Type check without building
pnpm lint          # Run ESLint
pnpm lint:fix      # Auto-fix linting issues
pnpm openapi       # Generate OpenAPI spec
pnpm tbk           # Run CLI tool (see below)
```

## CLI Tool

Generate new modules, plugins, and more:

```bash
pnpm tbk generate:module <name>     # Generate CRUD module
pnpm tbk generate:plugin <name>     # Generate plugin
pnpm tbk generate:middleware <name> # Generate middleware
```

## API Documentation

Once the server is running, visit:

- **Swagger UI:** http://localhost:3000/docs
- **OpenAPI Spec:** http://localhost:3000/openapi.yml

## Project Structure

```
src/
├── app/              # Application setup
├── config/           # Configuration
├── lib/              # Core libraries
├── middlewares/      # Express middlewares
├── modules/          # Feature modules
├── plugins/          # Plugin system
├── routes/           # Route registration
├── utils/            # Utilities
└── main.ts           # Entry point
```

## Learn More

- [TypeScript Backend Toolkit Documentation](https://github.com/your-repo)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

## License

ISC