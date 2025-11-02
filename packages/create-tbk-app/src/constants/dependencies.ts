import type { ProjectConfig } from '../types/config.types.js';

// Core dependencies - always included
export const CORE_DEPENDENCIES = {
  express: '^4.19.2',
  mongoose: '^8.19.2',
  zod: '^3.21.4',
  dotenv: '^16.4.5',
  '@asteasolutions/zod-to-openapi': '^7.1.1',
  'swagger-ui-express': '^5.0.1',
  'openapi3-ts': '^4.3.3',
  yaml: '^2.5.0',
  compression: '^1.7.4',
  'cookie-parser': '^1.4.6',
  validator: '^13.15.20',
  'express-async-handler': '^1.2.0',
  formidable: '^3.5.4',
  // Logger dependencies (logger plugin is always included)
  pino: '^9.1.0',
  'pino-http': '^10.1.0',
  'pino-pretty': '^11.1.0',
  // Basic observability dependencies (requestId middleware)
  nanoid: '^3.3.7',
};

export const CORE_DEV_DEPENDENCIES = {
  '@themuneebh-oss/tbk': '^0.0.3',
  typescript: '^5.1.6',
  '@types/express': '^4.17.15',
  '@types/node': '^24.9.2',
  '@types/cookie-parser': '^1.4.3',
  '@types/swagger-ui-express': '^4.1.6',
  '@types/validator': '^13.7.17',
  '@types/compression': '^1.7.2',
  '@types/formidable': '^3.4.6',
  tsup: '^8.1.0',
  tsx: '^4.19.2',
  'dotenv-cli': '^7.4.2',
  esbuild: '^0.19.8',
  rimraf: '^5.0.1',
  concurrently: '^9.1.0',
  commander: '^14.0.1',
  eslint: '~9.4.0',
  '@eslint/js': '^9.4.0',
  'typescript-eslint': '^8.46.2',
  'eslint-config-prettier': '^9.1.0',
  'eslint-plugin-prettier': '^5.1.3',
  'eslint-plugin-import': '^2.29.1',
  globals: '^15.3.0',
};

// Feature-specific dependencies
export const FEATURE_DEPENDENCIES = {
  auth: {
    dependencies: {
      jsonwebtoken: '^9.0.2',
      argon2: '^0.30.3',
    },
    devDependencies: {
      '@types/jsonwebtoken': '^9.0.6',
    },
  },
  security: {
    dependencies: {
      helmet: '^6.0.1',
      cors: '^2.8.5',
      'express-rate-limit': '^8.1.0',
    },
    devDependencies: {
      '@types/cors': '^2.8.13',
    },
  },
  observabilityFull: {
    dependencies: {
      // pino, pino-http, pino-pretty, and nanoid are now in CORE_DEPENDENCIES
      'prom-client': '^15.1.3',
    },
    devDependencies: {},
  },
  cacheRedis: {
    dependencies: {
      ioredis: '^5.8.2',
    },
    devDependencies: {},
  },
  queues: {
    dependencies: {
      bullmq: '^5.63.0',
    },
    devDependencies: {},
  },
  queueDashboard: {
    dependencies: {
      '@bull-board/api': '^6.14.0',
      '@bull-board/express': '^6.14.0',
    },
    devDependencies: {},
  },
  storage: {
    dependencies: {
      '@aws-sdk/client-s3': '^3.922.0',
    },
    devDependencies: {},
  },
  emailResend: {
    dependencies: {
      resend: '^4.0.0',
    },
    devDependencies: {},
  },
  emailMailgun: {
    dependencies: {
      'mailgun.js': '^10.2.4',
      'form-data': '^4.0.4',
    },
    devDependencies: {},
  },
  emailSmtp: {
    dependencies: {
      nodemailer: '^6.9.13',
    },
    devDependencies: {
      '@types/nodemailer': '^6.4.8',
    },
  },
  emailTemplates: {
    dependencies: {
      '@react-email/components': '^0.5.7',
      '@react-email/render': '^1.4.0',
      react: '^19.2.0',
      'react-email': '^4.3.2',
    },
    devDependencies: {
      '@types/react': '^19.2.2',
      '@react-email/preview-server': '^4.3.2',
    },
  },
  realtime: {
    dependencies: {
      'socket.io': '^4.7.5',
    },
    devDependencies: {},
  },
};

export function resolveDependencies(config: ProjectConfig): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  const dependencies = { ...CORE_DEPENDENCIES };
  const devDependencies = { ...CORE_DEV_DEPENDENCIES };

  // Helper to merge feature dependencies
  const addFeature = (feature: keyof typeof FEATURE_DEPENDENCIES) => {
    Object.assign(dependencies, FEATURE_DEPENDENCIES[feature].dependencies);
    Object.assign(
      devDependencies,
      FEATURE_DEPENDENCIES[feature].devDependencies,
    );
  };

  // Security plugin (always included for standard and full presets)
  if (config.preset !== 'minimal') {
    addFeature('security');
  }

  // Auth
  if (config.auth !== 'none') {
    addFeature('auth');

    // Sessions require Redis (for Redis driver) or BullMQ (for cleanup queue)
    if (config.auth === 'jwt-sessions') {
      // Always add BullMQ for session cleanup queue
      addFeature('queues');

      // Add Redis if using Redis session driver or if cache isn't already Redis
      if (config.sessionDriver === 'redis' || config.cache !== 'redis') {
        addFeature('cacheRedis');
      }
    }
  }

  // Observability
  if (config.observability === 'full') {
    addFeature('observabilityFull');
  }

  // Cache
  if (config.cache === 'redis') {
    addFeature('cacheRedis');
  }

  // Queues
  if (config.queues) {
    addFeature('queues');
    // Queues require Redis
    if (config.cache !== 'redis') {
      addFeature('cacheRedis');
    }
  }

  // Queue Dashboard
  if (config.queueDashboard && config.queues) {
    addFeature('queueDashboard');
  }

  // Storage
  if (config.storage !== 'none') {
    addFeature('storage');
  }

  // Email
  if (config.email !== 'none') {
    addFeature('emailTemplates');
    if (config.email === 'resend') {
      addFeature('emailResend');
    } else if (config.email === 'mailgun') {
      addFeature('emailMailgun');
    } else if (config.email === 'smtp') {
      addFeature('emailSmtp');
    }
  }

  // Realtime
  if (config.realtime) {
    addFeature('realtime');
  }

  return { dependencies, devDependencies };
}

export function generateScripts(config: ProjectConfig): Record<string, string> {
  const scripts: Record<string, string> = {
    dev:
      config.email !== 'none'
        ? 'concurrently "pnpm start:dev" "pnpm email:dev"'
        : 'pnpm start:dev',
    'start:dev': 'dotenv -e .env.development -- tsx --watch ./src/main.ts',
    build: 'tsup --config build.ts',
    'start:prod': 'dotenv -e .env.production -- node ./dist/main.js',
    'start:local': 'dotenv -e .env.local -- node ./dist/main.js',
    typecheck: 'tsc --noEmit',
    lint: 'eslint',
    'lint:fix': 'eslint --fix',
    tbk: 'dotenv -e .env.development -- node --import tsx ./node_modules/@themuneebh-oss/tbk/dist/cli.js',
  };

  // Add email dev script if email is enabled
  if (config.email !== 'none') {
    scripts['email:dev'] = 'email dev --dir ./src/email/templates';
  }

  // Add seed script if auth is enabled (user module with factories)
  if (config.auth !== 'none') {
    scripts.seed = 'dotenv -e .env.development -- tsx scripts/seed.ts';
  }

  return scripts;
}
