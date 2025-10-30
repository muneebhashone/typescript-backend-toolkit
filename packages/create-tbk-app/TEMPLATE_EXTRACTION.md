# Template Extraction Guide

This document outlines the process for extracting files from the main TypeScript Backend Toolkit into Handlebars templates for `create-tbk-app`.

## Overview

The template extraction process involves:
1. Copying files from `src/` to `templates/`
2. Adding Handlebars variables and conditionals
3. Organizing by feature/plugin
4. Testing with different preset configurations

## Directory Structure

```
packages/create-tbk-app/templates/
├── base/                    # Core files (always copied)
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── lib/
│   │   │   ├── database.ts
│   │   │   └── errors.ts
│   │   ├── middlewares/
│   │   │   └── error-handler.ts
│   │   ├── plugins/
│   │   │   ├── types.ts
│   │   │   ├── basicParser/
│   │   │   ├── magic/
│   │   │   └── lifecycle/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── main.ts
│   ├── public/
│   ├── bin/
│   ├── tsconfig.json
│   ├── build.ts
│   └── eslint.config.js
│
├── plugins/                 # Optional plugin templates
│   ├── security/
│   ├── auth/
│   ├── realtime/
│   ├── admin/
│   ├── bullboard/
│   ├── cache/
│   └── observability/
│
├── modules/                 # Optional module templates
│   ├── auth/
│   ├── user/
│   └── healthcheck/
│
├── lib/                     # Optional service templates
│   ├── cache.ts
│   ├── queue.ts
│   ├── storage.ts
│   └── email.ts
│
└── configs/                 # Config file templates
    ├── .env.template.hbs
    ├── README.template.hbs
    └── package.json.template.hbs
```

## Step-by-Step Extraction Process

### Phase 1: Core Base Templates

These files are ALWAYS included regardless of preset:

#### 1.1 Application Setup
```bash
# Copy these files from src/ to templates/base/src/
src/main.ts
src/app/app.ts
src/app/createApp.ts
```

**Template modifications for `app.ts`:**
```typescript
// Add conditional plugin imports
{{#if SECURITY}}
import securityPlugin from '@/plugins/security';
{{/if}}
{{#if AUTH}}
import authPlugin from '@/plugins/auth';
{{/if}}
{{#if REALTIME}}
import realtimePlugin from '@/plugins/realtime';
{{/if}}
{{#if ADMIN}}
import adminPlugin from '@/plugins/admin';
{{/if}}
{{#if QUEUE_DASHBOARD}}
import bullboardPlugin from '@/plugins/bullboard';
{{/if}}
{{#if CACHE}}
import cachePlugin from '@/plugins/cache';
{{/if}}

// Conditional plugin registration
const plugins: ToolkitPlugin[] = [
  basicParserPlugin(),
  {{#if SECURITY}}
  securityPlugin(),
  {{/if}}
  {{#if OBSERVABILITY_FULL}}
  observabilityPlugin({ metricsEnabled: true }),
  {{else}}
  observabilityPlugin({ metricsEnabled: false }),
  {{/if}}
  {{#if AUTH}}
  authPlugin(),
  {{/if}}
  {{#if CACHE}}
  cachePlugin(),
  {{/if}}
  {{#if REALTIME}}
  realtimePlugin(),
  {{/if}}
  {{#if ADMIN}}
  adminPlugin(),
  {{/if}}
  {{#if QUEUE_DASHBOARD}}
  bullboardPlugin(),
  {{/if}}
  magicPlugin({ docsPath: '/docs' }),
  lifecyclePlugin(),
];
```

#### 1.2 Configuration
```bash
src/config/env.ts  # Needs heavy templating
```

**Template modifications for `env.ts`:**
- Add conditional validation for optional features
- Use `{{#if AUTH}}` for JWT-related configs
- Use `{{#if CACHE_REDIS}}` for Redis configs
- Use `{{#if STORAGE}}` for storage configs
- Use `{{#if EMAIL}}` for email configs

#### 1.3 Database
```bash
src/lib/database.ts  # Copy as-is
src/lib/errors.ts    # Copy as-is
```

#### 1.4 Core Plugins (Always included)
```bash
src/plugins/types.ts
src/plugins/basicParser/
src/plugins/magic/
src/plugins/lifecycle/
```

#### 1.5 Middleware
```bash
src/middlewares/error-handler.ts  # Copy as-is
```

#### 1.6 Routes
```bash
src/routes/routes.ts  # Needs conditional imports
```

**Template modifications:**
```typescript
{{#if AUTH}}
import authRouter from '@/modules/auth/auth.router';
import userRouter from '@/modules/user/user.router';
{{/if}}
import healthcheckRouter from '@/modules/healthcheck/healthcheck.router';

export default function registerRoutes(app: Express) {
  {{#if AUTH}}
  app.use('/api', authRouter);
  app.use('/api', userRouter);
  {{/if}}
  app.use('/api', healthcheckRouter);
}
```

#### 1.7 Utilities
```bash
src/utils/  # Copy all files
```

Some utilities need conditional copying:
- `jwt.utils.ts` - Only if AUTH
- `password.utils.ts` - Only if AUTH

#### 1.8 Types
```bash
src/types/  # Copy all files
```

#### 1.9 Build Configuration
```bash
tsconfig.json     # Copy as-is
build.ts          # Copy as-is
eslint.config.js  # Copy as-is
```

#### 1.10 Public Assets
```bash
public/  # Copy all files
```

#### 1.11 CLI Tool
```bash
bin/tbk.ts       # Copy as-is
bin/actions/     # Copy all files
```

### Phase 2: Optional Plugin Templates

#### 2.1 Security Plugin
```bash
# If SECURITY flag is true
templates/plugins/security/
└── index.ts
```

#### 2.2 Auth Plugin
```bash
# If AUTH flag is true
templates/plugins/auth/
└── index.ts
```

#### 2.3 Observability Plugin
```bash
# Always included, but with conditional features
templates/plugins/observability/
├── index.ts       # Conditional metrics
├── logger.ts      # Always included
├── metrics.ts     # Only if OBSERVABILITY_FULL
└── request-id.ts  # Always included
```

#### 2.4 Realtime Plugin
```bash
# If REALTIME flag is true
templates/plugins/realtime/
├── index.ts
└── realtime-ui.html
```

#### 2.5 Admin Plugin
```bash
# If ADMIN flag is true
templates/plugins/admin/
├── index.ts
├── registry.ts
├── ui.html
└── styles.css
```

#### 2.6 BullBoard Plugin
```bash
# If QUEUE_DASHBOARD flag is true
templates/plugins/bullboard/
└── index.ts
```

#### 2.7 Cache Plugin
```bash
# If CACHE flag is true
templates/plugins/cache/
├── index.ts
├── cache.middleware.ts
└── cache.service.ts
```

### Phase 3: Module Templates

#### 3.1 Auth Module
```bash
# If AUTH flag is true
templates/modules/auth/
├── auth.dto.ts
├── auth.schema.ts
├── auth.services.ts
├── auth.controller.ts
├── auth.router.ts
└── session/           # Only if AUTH_SESSIONS
    ├── session.model.ts
    ├── session.service.ts
    └── types.ts
```

#### 3.2 User Module
```bash
# If AUTH flag is true
templates/modules/user/
├── user.dto.ts
├── user.model.ts
├── user.schema.ts
├── user.services.ts
├── user.controller.ts
└── user.router.ts
```

#### 3.3 Health Check Module
```bash
# Always included
templates/modules/healthcheck/
├── healthcheck.dto.ts
├── healthcheck.schema.ts
├── healthcheck.services.ts
├── healthcheck.controller.ts
└── healthcheck.router.ts
```

### Phase 4: Library Templates

#### 4.1 Cache Library
```bash
# If CACHE flag is true
templates/lib/cache.ts
```

**Template modifications:**
```typescript
{{#if CACHE_REDIS}}
import Redis from 'ioredis';
{{/if}}

// Provider selection
{{#if CACHE_REDIS}}
const provider = 'redis';
{{else if CACHE_MEMORY}}
const provider = 'memory';
{{/if}}
```

#### 4.2 Queue Library
```bash
# If QUEUES flag is true
templates/lib/queue.ts
templates/queues/
```

#### 4.3 Storage Library
```bash
# If STORAGE flag is true
templates/lib/storage.ts
```

**Template modifications:**
```typescript
{{#if STORAGE_S3}}
import { S3Client } from '@aws-sdk/client-s3';
{{/if}}
{{#if STORAGE_R2}}
import { S3Client } from '@aws-sdk/client-s3';
{{/if}}

// Provider factory
export function createStorageProvider() {
  {{#if STORAGE_LOCAL}}
  return createLocalProvider();
  {{else if STORAGE_S3}}
  return createS3Provider();
  {{else if STORAGE_R2}}
  return createR2Provider();
  {{/if}}
}
```

#### 4.4 Email Library
```bash
# If EMAIL flag is true
templates/lib/email.ts
templates/email/
```

**Template modifications:**
```typescript
{{#if EMAIL_RESEND}}
import { Resend } from 'resend';
{{else if EMAIL_MAILGUN}}
import Mailgun from 'mailgun.js';
{{else if EMAIL_SMTP}}
import nodemailer from 'nodemailer';
{{/if}}
```

### Phase 5: Middleware Templates

#### 5.1 Auth Middleware
```bash
# If AUTH flag is true
templates/base/src/middlewares/extract-jwt.ts
templates/base/src/middlewares/can-access.ts
```

### Phase 6: Scripts and Seeders

#### 6.1 Scripts
```bash
# Always copy
templates/base/scripts/gen-openapi.ts

# Only if AUTH (for seeding)
{{#if AUTH}}
templates/base/scripts/seed.ts
{{/if}}
```

#### 6.2 Factories and Seeders
```bash
# If AUTH flag is true (for user seeding)
templates/base/src/modules/user/user.factory.ts
templates/base/src/modules/user/user.seeder.ts
```

## Implementation in Generator

Update `src/generators/project.generator.ts`:

```typescript
async function copyTemplateFiles(
  targetDir: string,
  config: ProjectConfig,
  context: TemplateContext,
): Promise<void> {
  const templateBaseDir = path.join(__dirname, '../../templates');

  // 1. Always copy base templates
  await copyAndRenderDirectory(
    path.join(templateBaseDir, 'base'),
    targetDir,
    context,
  );

  // 2. Conditionally copy plugins
  if (context.SECURITY) {
    await copyAndRenderDirectory(
      path.join(templateBaseDir, 'plugins/security'),
      path.join(targetDir, 'src/plugins/security'),
      context,
    );
  }

  if (context.AUTH) {
    await copyAndRenderDirectory(
      path.join(templateBaseDir, 'plugins/auth'),
      path.join(targetDir, 'src/plugins/auth'),
      context,
    );
    await copyAndRenderDirectory(
      path.join(templateBaseDir, 'modules/auth'),
      path.join(targetDir, 'src/modules/auth'),
      context,
    );
    await copyAndRenderDirectory(
      path.join(templateBaseDir, 'modules/user'),
      path.join(targetDir, 'src/modules/user'),
      context,
    );
  }

  // 3. Continue for other features...
}

async function copyAndRenderDirectory(
  sourceDir: string,
  targetDir: string,
  context: TemplateContext,
): Promise<void> {
  const files = await fs.readdir(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file.replace('.hbs', ''));
    const stats = await fs.stat(sourcePath);

    if (stats.isDirectory()) {
      await copyAndRenderDirectory(sourcePath, targetPath, context);
    } else {
      // Read file content
      const content = await fs.readFile(sourcePath, 'utf-8');

      // If file ends with .hbs, render as Handlebars template
      if (file.endsWith('.hbs')) {
        const rendered = renderTemplate(content, context);
        await writeFile(targetPath, rendered);
      } else {
        // Copy as-is
        await copyFile(sourcePath, targetPath);
      }
    }
  }
}
```

## Handlebars Conventions

### File Naming
- Add `.hbs` extension to files that need templating
- Example: `app.ts.hbs`, `env.ts.hbs`, `routes.ts.hbs`

### Variable Naming
Use the context variables defined in `TemplateContext`:
- `{{PROJECT_NAME}}` - Project name
- `{{PROJECT_NAME_KEBAB}}` - Kebab-case project name
- `{{PROJECT_NAME_PASCAL}}` - PascalCase project name

### Conditional Blocks
```handlebars
{{#if AUTH}}
// Auth-specific code
{{/if}}

{{#if CACHE_REDIS}}
// Redis-specific code
{{else if CACHE_MEMORY}}
// Memory cache code
{{/if}}

{{#if or AUTH ADMIN}}
// Code for auth OR admin
{{/if}}
```

### Common Patterns

**Conditional imports:**
```typescript
{{#if AUTH}}
import authPlugin from '@/plugins/auth';
{{/if}}
```

**Conditional plugin registration:**
```typescript
const plugins = [
  basePlugin(),
  {{#if FEATURE}}
  featurePlugin(),
  {{/if}}
];
```

**Conditional environment variables:**
```env
{{#if AUTH}}
JWT_SECRET=your-secret
{{/if}}
```

## Testing Templates

After extraction, test each preset:

```bash
# Build CLI
cd packages/create-tbk-app
pnpm build

# Test minimal preset
cd ../..
node packages/create-tbk-app/dist/cli.js test-minimal --preset=minimal
cd test-minimal && pnpm install && pnpm typecheck

# Test standard preset
node packages/create-tbk-app/dist/cli.js test-standard --preset=standard
cd test-standard && pnpm install && pnpm typecheck

# Test full preset
node packages/create-tbk-app/dist/cli.js test-full --preset=full
cd test-full && pnpm install && pnpm typecheck

# Clean up
rm -rf test-minimal test-standard test-full
```

## Validation Checklist

For each generated project, verify:

- [ ] `pnpm install` succeeds
- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] Generated `.env.example` has correct variables for selected features
- [ ] `package.json` has correct dependencies
- [ ] `README.md` accurately describes selected features
- [ ] No unused imports or dead code
- [ ] No missing dependencies
- [ ] Plugin registration order is correct

## Priority Order

1. **High Priority** (for MVP)
   - Base templates (core files)
   - Minimal preset support
   - Basic auth support
   - Configuration file generation

2. **Medium Priority**
   - Standard preset support
   - All plugin templates
   - Module templates
   - Library templates

3. **Low Priority** (polish)
   - Full preset support
   - Email templates
   - Seeder templates
   - Advanced features

## Next Steps

1. Start with Phase 1 (Core Base Templates)
2. Create `copyAndRenderDirectory` helper function
3. Test minimal preset generation
4. Move to Phase 2 (Plugin Templates)
5. Continue incrementally, testing after each phase

## Notes

- Keep original files in `src/` untouched
- Templates should be self-contained (no references to main project)
- Test frequently with different preset combinations
- Document any edge cases or special handling needed
