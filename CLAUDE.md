# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm run dev` - Starts both backend and email template development server
- **Backend only**: `pnpm run start:dev` - Starts just the backend with hot reload
- **Build**: `pnpm run build` - Builds the project using tsup
- **Production start**: `pnpm run start:prod` - Starts production build with .env.production
- **Local start**: `pnpm run start:local` - Starts production build with .env.local
- **Database seeder**: `pnpm run seeder` - Runs database seeding scripts
- **Linting**: `pnpm run lint` - Runs ESLint, `pnpm run lint:fix` - Auto-fixes linting issues
- **Email templates**: `pnpm run email:dev` - Starts email template development server

## Architecture Overview

This is a TypeScript Express.js backend toolkit with the following key architectural components:

### Core Architecture
- **MagicRouter System**: Custom routing ([src/openapi/magic-router.ts](src/openapi/magic-router.ts)) that automatically generates OpenAPI/Swagger documentation from Zod schemas
- **Module-based structure**: Features organized in modules under [src/modules/](src/modules/) (auth, user)
- **Configuration management**: Type-safe config using Zod validation in [src/config/config.service.ts](src/config/config.service.ts)
- **Database**: MongoDB with Mongoose ODM, connection managed in [src/lib/database.ts](src/lib/database.ts)

### Key Features
- **Authentication**: JWT-based with optional OTP verification, Google OAuth support
- **File Uploads**: Multer with S3 integration via [src/lib/aws.service.ts](src/lib/aws.service.ts)
- **Email System**: React Email templates with Mailgun provider, queue-based sending
- **Real-time**: Socket.io integration with Redis adapter
- **Background Jobs**: BullMQ with Redis for email queues and other background tasks
- **API Documentation**: Auto-generated Swagger docs at `/api-docs` from MagicRouter
- **Queue Dashboard**: BullMQ admin dashboard at `/admin/queues`

### Middleware Stack
- Request validation with Zod schemas ([src/middlewares/validate-zod-schema.middleware.ts](src/middlewares/validate-zod-schema.middleware.ts))
- JWT extraction and authorization ([src/middlewares/extract-jwt-schema.middleware.ts](src/middlewares/extract-jwt-schema.middleware.ts))
- File upload handling with S3 ([src/middlewares/multer-s3.middleware.ts](src/middlewares/multer-s3.middleware.ts))
- Access control middleware ([src/middlewares/can-access.middleware.ts](src/middlewares/can-access.middleware.ts))

### Environment Setup
1. Start Docker services: `docker compose up -d` (MongoDB + Redis)
2. Install dependencies: `pnpm i`
3. Configure environment variables using `.env.sample` as template

### Key Patterns
- **MagicRouter**: All API routes use MagicRouter for automatic OpenAPI generation
- **Zod Schemas**: Every route uses Zod for request/response validation
- **Service Layer**: Business logic separated into service files
- **Queue-based**: Email sending and background jobs use BullMQ queues
- **Type Safety**: Full TypeScript coverage with Zod for runtime validation

### File Upload & Storage
- Multer middleware handles file uploads
- AWS S3 integration for file storage
- File upload routes in [src/upload/](src/upload/)

### Email System
- React Email for template development
- Mailgun for email delivery
- Queue-based sending system in [src/queues/email.queue.ts](src/queues/email.queue.ts)

## Important Notes
- All expiration times in config are in milliseconds (converted from strings)
- The project uses pnpm as package manager
- Database seeding is available via the seeder script
- Global error handling in [src/utils/globalErrorHandler.ts](src/utils/globalErrorHandler.ts)
- Logging uses Pino logger with pretty printing in development