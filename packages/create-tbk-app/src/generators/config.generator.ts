import path from 'path';
import type { ProjectConfig, TemplateContext } from '../types/config.types.js';
import { writeFile } from '../utils/file.utils.js';
import { resolveDependencies, generateScripts } from '../constants/dependencies.js';

export async function generatePackageJson(
  targetDir: string,
  config: ProjectConfig,
  context: TemplateContext,
): Promise<void> {
  const { dependencies, devDependencies } = resolveDependencies(config);
  const scripts = generateScripts(config);

  const packageJson = {
    name: config.projectName,
    version: '1.0.0',
    description: `Backend API generated with create-tbk-app (${config.preset} preset)`,
    main: 'dist/main.js',
    type: 'commonjs',
    scripts,
    keywords: ['typescript', 'backend', 'express', 'mongodb', 'api'],
    author: '',
    license: 'ISC',
    dependencies,
    devDependencies,
    engines: {
      node: '>=18.0.0',
    },
    packageManager: `${config.packageManager}@9.9.0`,
  };

  const filePath = path.join(targetDir, 'package.json');
  await writeFile(filePath, JSON.stringify(packageJson, null, 2));
}

export async function generateEnvExample(
  targetDir: string,
  config: ProjectConfig,
  context: TemplateContext,
): Promise<void> {
  const lines: string[] = [];

  // Core configuration
  lines.push('# Core Configuration');
  lines.push('PORT=3000');
  lines.push('NODE_ENV=development');
  lines.push('');
  lines.push('# Database');
  lines.push(`MONGO_DATABASE_URL=mongodb://localhost:27017/${config.projectName}`);
  lines.push('');
  lines.push('# Client');
  lines.push('CLIENT_SIDE_URL=http://localhost:3000');
  lines.push('');

  // Auth
  if (context.AUTH) {
    lines.push('# Authentication');
    lines.push('JWT_SECRET=your-secret-key-change-this-in-production');
    lines.push('JWT_EXPIRES_IN=86400');
    lines.push('');

    if (context.AUTH_GOOGLE_OAUTH) {
      lines.push('# Google OAuth');
      lines.push('GOOGLE_CLIENT_ID=your-google-client-id');
      lines.push('GOOGLE_CLIENT_SECRET=your-google-client-secret');
      lines.push('GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback');
      lines.push('');
    }

    if (context.AUTH_SESSIONS) {
      lines.push('# Session Management');
      lines.push('SET_SESSION=1');
      lines.push(`SESSION_DRIVER=${context.SESSION_DRIVER}`);
      lines.push('SESSION_EXPIRES_IN=604800');
      lines.push('SESSION_IDLE_TIMEOUT=86400');
      lines.push('SESSION_ABSOLUTE_TIMEOUT=2592000');
      lines.push('MAX_SESSIONS_PER_USER=5');
      lines.push('SESSION_ROTATION_ENABLED=1');
      lines.push('SESSION_DEBUG=0');
      lines.push('');
    }
  }

  // Cache and Redis
  if (context.CACHE_REDIS || context.QUEUES) {
    lines.push('# Redis');
    lines.push('REDIS_URL=redis://localhost:6379');
    lines.push('');

    if (context.CACHE_REDIS) {
      lines.push('# Cache');
      lines.push('CACHE_PROVIDER=redis');
      lines.push('CACHE_ENABLED=1');
      lines.push('CACHE_PREFIX=app');
      lines.push('CACHE_TTL=3600');
      lines.push('');
    }
  } else if (context.CACHE_MEMORY) {
    lines.push('# Cache');
    lines.push('CACHE_PROVIDER=memory');
    lines.push('CACHE_ENABLED=1');
    lines.push('');
  }

  // Storage
  if (context.STORAGE) {
    lines.push('# File Storage');
    lines.push(`STORAGE_PROVIDER=${context.STORAGE_PROVIDER}`);

    if (context.STORAGE_S3 || context.STORAGE_R2) {
      lines.push('AWS_REGION=us-east-1');
      lines.push('AWS_ACCESS_KEY_ID=your-access-key');
      lines.push('AWS_SECRET_ACCESS_KEY=your-secret-key');
      lines.push('AWS_S3_BUCKET=your-bucket-name');

      if (context.STORAGE_R2) {
        lines.push('AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com');
      }
    } else if (context.STORAGE_LOCAL) {
      lines.push('LOCAL_STORAGE_PATH=./uploads');
    }

    lines.push('');
  }

  // Email
  if (context.EMAIL) {
    lines.push('# Email');
    lines.push('EMAIL_FROM=noreply@example.com');
    lines.push('EMAIL_FROM_NAME=My App');

    if (context.EMAIL_RESEND) {
      lines.push('RESEND_API_KEY=your-resend-api-key');
    } else if (context.EMAIL_MAILGUN) {
      lines.push('MAILGUN_API_KEY=your-mailgun-api-key');
      lines.push('MAILGUN_DOMAIN=your-domain.com');
    } else if (context.EMAIL_SMTP) {
      lines.push('SMTP_HOST=smtp.example.com');
      lines.push('SMTP_PORT=587');
      lines.push('SMTP_USER=your-smtp-username');
      lines.push('SMTP_PASSWORD=your-smtp-password');
      lines.push('SMTP_SECURE=false');
    }

    lines.push('');
  }

  // Security
  if (context.SECURITY) {
    lines.push('# Security');
    lines.push('CORS_ENABLED=1');
    lines.push('CORS_ORIGINS=http://localhost:3000,http://localhost:5173');
    lines.push('CORS_CREDENTIALS=1');
    lines.push('HELMET_ENABLED=1');
    lines.push('RATE_LIMIT_ENABLED=1');
    lines.push('RATE_LIMIT_WINDOW_MS=60000');
    lines.push('RATE_LIMIT_MAX=100');
    lines.push('TRUST_PROXY=0');
    lines.push('');
  }

  // Admin Panel
  if (context.ADMIN) {
    lines.push('# Admin Panel');
    lines.push('ADMIN_AUTH_ENABLED=1');
    lines.push('ADMIN_USERNAME=admin');
    lines.push('ADMIN_PASSWORD=change-this-password');
    lines.push('');
  }

  // Queue Dashboard
  if (context.QUEUE_DASHBOARD) {
    lines.push('# Queue Dashboard');
    lines.push('QUEUE_AUTH_ENABLED=1');
    lines.push('QUEUE_USERNAME=admin');
    lines.push('QUEUE_PASSWORD=change-this-password');
    lines.push('');
  }

  // Logging
  lines.push('# Logging');
  lines.push('LOG_LEVEL=debug  # trace | debug | info | warn | error | fatal');
  lines.push('');

  // Observability
  if (context.OBSERVABILITY_FULL) {
    lines.push('# Observability');
    lines.push('METRICS_ENABLED=1');
    lines.push('');
  }

  // Response validation
  lines.push('# Response Validation');
  lines.push('RESPONSE_VALIDATION=warn  # strict | warn | off');

  // OTP VERIFICATION
  lines.push('# OTP Verification');
  lines.push('OTP_VERIFICATION_ENABLED=false');
  lines.push('');

  // ADMIN EMAIL AND PASSWORD
  lines.push('# Admin Email and Password');
  lines.push('ADMIN_EMAIL=admin@example.com');
  lines.push('');

  const filePath = path.join(targetDir, '.env.example');
  await writeFile(filePath, lines.join('\n'));
}

export async function generateGitignore(targetDir: string): Promise<void> {
  const content = `# Dependencies
node_modules/

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.development
.env.production

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads (if using local storage)
uploads/

# Test coverage
coverage/

# Temporary files
tmp/
temp/
`;

  const filePath = path.join(targetDir, '.gitignore');
  await writeFile(filePath, content);
}

export async function generateReadme(
  targetDir: string,
  config: ProjectConfig,
  context: TemplateContext,
): Promise<void> {
  const lines: string[] = [];

  lines.push(`# ${config.projectName}`);
  lines.push('');
  lines.push(`Backend API generated with **create-tbk-app** using the **${config.preset}** preset.`);
  lines.push('');
  lines.push('## Features');
  lines.push('');

  const features: string[] = [];
  features.push('- TypeScript + Express.js');
  features.push('- MongoDB with Mongoose');
  features.push('- Auto-generated OpenAPI documentation');
  features.push('- Type-safe routing with MagicRouter');
  features.push('- Structured logging with Pino');

  if (context.AUTH) {
    if (context.AUTH_SESSIONS) {
      features.push(`- JWT Authentication with Session Management (${context.SESSION_DRIVER})`);
    } else {
      features.push('- JWT Authentication');
    }
  }

  if (context.SECURITY) {
    features.push('- Security hardening (Helmet, CORS, Rate Limiting)');
  }

  if (context.CACHE) {
    features.push(`- Caching (${context.CACHE_REDIS ? 'Redis' : 'Memory'})`);
  }

  if (context.QUEUES) {
    features.push('- Background jobs (BullMQ)');
  }

  if (context.QUEUE_DASHBOARD) {
    features.push('- Queue monitoring dashboard');
  }

  if (context.STORAGE) {
    features.push(`- File storage (${context.STORAGE_PROVIDER?.toUpperCase()})`);
  }

  if (context.EMAIL) {
    features.push(`- Email sending (${context.EMAIL_PROVIDER})`);
  }

  if (context.REALTIME) {
    features.push('- Real-time features (Socket.IO)');
  }

  if (context.ADMIN) {
    features.push('- Admin panel');
  }

  if (context.OBSERVABILITY_FULL) {
    features.push('- Full observability (Logging, Metrics, Health checks)');
  }

  lines.push(...features);
  lines.push('');

  lines.push('## Getting Started');
  lines.push('');
  lines.push('### Prerequisites');
  lines.push('');
  lines.push('- Node.js >= 18.0.0');
  lines.push('- MongoDB');

  if (context.CACHE_REDIS || context.QUEUES) {
    lines.push('- Redis');
  }

  lines.push('');

  lines.push('### Installation');
  lines.push('');
  lines.push('1. Install dependencies:');
  lines.push('');
  lines.push('```bash');
  lines.push(`${config.packageManager} install`);
  lines.push('```');
  lines.push('');
  lines.push('2. Copy environment variables:');
  lines.push('');
  lines.push('```bash');
  lines.push('cp .env.example .env.development');
  lines.push('```');
  lines.push('');
  lines.push('3. Update `.env.development` with your configuration');
  lines.push('');

  if (context.STORAGE_S3 || context.STORAGE_R2) {
    lines.push('> **Note:** Configure your AWS/R2 credentials for file storage');
    lines.push('');
  }

  if (context.EMAIL) {
    lines.push(`> **Note:** Configure your ${context.EMAIL_PROVIDER} API key for email sending`);
    lines.push('');
  }

  lines.push('4. Start development server:');
  lines.push('');
  lines.push('```bash');
  lines.push(`${config.packageManager} dev`);
  lines.push('```');
  lines.push('');

  lines.push('## Available Commands');
  lines.push('');
  lines.push('```bash');
  lines.push(`${config.packageManager} dev           # Start dev server with hot reload`);
  lines.push(`${config.packageManager} build         # Build for production`);
  lines.push(`${config.packageManager} start:prod    # Run production build`);
  lines.push(`${config.packageManager} typecheck     # Type check without building`);
  lines.push(`${config.packageManager} lint          # Run ESLint`);
  lines.push(`${config.packageManager} lint:fix      # Auto-fix linting issues`);
  lines.push(`${config.packageManager} openapi       # Generate OpenAPI spec`);
  lines.push(`${config.packageManager} tbk           # Run CLI tool (see below)`);
  lines.push('```');
  lines.push('');

  lines.push('## CLI Tool');
  lines.push('');
  lines.push('Generate new modules, plugins, and more:');
  lines.push('');
  lines.push('```bash');
  lines.push(`${config.packageManager} tbk generate:module <name>     # Generate CRUD module`);
  lines.push(`${config.packageManager} tbk generate:plugin <name>     # Generate plugin`);
  lines.push(`${config.packageManager} tbk generate:middleware <name> # Generate middleware`);

  if (context.AUTH) {
    lines.push(`${config.packageManager} tbk make:factory <module>/<name>    # Generate factory`);
    lines.push(`${config.packageManager} tbk make:seeder <module>/<name>     # Generate seeder`);
    lines.push(`${config.packageManager} tbk seed                            # Run seeders`);
  }

  lines.push('```');
  lines.push('');

  lines.push('## API Documentation');
  lines.push('');
  lines.push('Once the server is running, visit:');
  lines.push('');
  lines.push('- **Swagger UI:** http://localhost:3000/docs');
  lines.push('- **OpenAPI Spec:** http://localhost:3000/openapi.yml');
  lines.push('');

  if (context.OBSERVABILITY_FULL) {
    lines.push('## Monitoring');
    lines.push('');
    lines.push('- **Health Check:** http://localhost:3000/ops/health');
    lines.push('- **Metrics:** http://localhost:3000/ops/metrics');
    lines.push('');
  }

  if (context.ADMIN) {
    lines.push('## Admin Panel');
    lines.push('');
    lines.push('Access the admin panel at http://localhost:3000/admin');
    lines.push('');
    lines.push('Default credentials (change in `.env.development`):');
    lines.push('- Username: admin');
    lines.push('- Password: change-this-password');
    lines.push('');
  }

  if (context.QUEUE_DASHBOARD) {
    lines.push('## Queue Dashboard');
    lines.push('');
    lines.push('Monitor background jobs at http://localhost:3000/queues');
    lines.push('');
  }

  if (context.REALTIME) {
    lines.push('## Real-time Testing');
    lines.push('');
    lines.push('Test Socket.IO at http://localhost:3000/realtime');
    lines.push('');
  }

  lines.push('## Project Structure');
  lines.push('');
  lines.push('```');
  lines.push('src/');
  lines.push('├── app/              # Application setup');
  lines.push('├── config/           # Configuration');
  lines.push('├── lib/              # Core libraries');
  lines.push('├── middlewares/      # Express middlewares');
  lines.push('├── modules/          # Feature modules');
  lines.push('├── plugins/          # Plugin system');
  lines.push('├── routes/           # Route registration');
  lines.push('├── utils/            # Utilities');
  lines.push('└── main.ts           # Entry point');
  lines.push('```');
  lines.push('');

  lines.push('## Learn More');
  lines.push('');
  lines.push('- [TypeScript Backend Toolkit Documentation](https://github.com/your-repo)');
  lines.push('- [Express.js Documentation](https://expressjs.com/)');
  lines.push('- [Mongoose Documentation](https://mongoosejs.com/)');
  lines.push('');

  lines.push('## License');
  lines.push('');
  lines.push('ISC');

  const filePath = path.join(targetDir, 'README.md');
  await writeFile(filePath, lines.join('\n'));
}
