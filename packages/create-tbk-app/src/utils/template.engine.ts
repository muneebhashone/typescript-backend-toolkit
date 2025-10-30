import Handlebars from 'handlebars';
import type { ProjectConfig, TemplateContext } from '../types/config.types.js';
import { toKebabCase, toPascalCase } from './validation.js';

export function createTemplateContext(config: ProjectConfig): TemplateContext {
  return {
    PROJECT_NAME: config.projectName,
    PROJECT_NAME_KEBAB: toKebabCase(config.projectName),
    PROJECT_NAME_PASCAL: toPascalCase(config.projectName),

    // Auth
    AUTH: config.auth !== 'none',
    AUTH_JWT: config.auth === 'jwt' || config.auth === 'jwt-sessions',
    AUTH_SESSIONS: config.auth === 'jwt-sessions',
    SESSION_DRIVER: config.auth === 'jwt-sessions' ? config.sessionDriver || 'mongo' : null,

    // Cache
    CACHE: config.cache !== 'none',
    CACHE_MEMORY: config.cache === 'memory',
    CACHE_REDIS: config.cache === 'redis',

    // Queues
    QUEUES: config.queues,
    QUEUE_DASHBOARD: config.queueDashboard && config.queues,

    // Storage
    STORAGE: config.storage !== 'none',
    STORAGE_LOCAL: config.storage === 'local',
    STORAGE_S3: config.storage === 's3',
    STORAGE_R2: config.storage === 'r2',
    STORAGE_PROVIDER: config.storage !== 'none' ? config.storage : null,

    // Email
    EMAIL: config.email !== 'none',
    EMAIL_RESEND: config.email === 'resend',
    EMAIL_MAILGUN: config.email === 'mailgun',
    EMAIL_SMTP: config.email === 'smtp',
    EMAIL_PROVIDER: config.email !== 'none' ? config.email : null,

    // Realtime
    REALTIME: config.realtime,

    // Admin
    ADMIN: config.admin,

    // Observability
    OBSERVABILITY_BASIC: config.observability === 'basic',
    OBSERVABILITY_FULL: config.observability === 'full',

    // Security (enabled for standard and full presets)
    SECURITY: config.preset !== 'minimal',

    // Preset
    PRESET: config.preset,
  };
}

export function renderTemplate(templateContent: string, context: TemplateContext): string {
  const template = Handlebars.compile(templateContent);
  return template(context);
}

export function shouldIncludeFile(filePath: string, context: TemplateContext): boolean {
  const fileName = filePath.toLowerCase();

  // Always include files in /lib/ - they contain conditional stubs
  const isLibFile = fileName.includes('/lib/') || fileName.includes('\\lib\\');
  if (isLibFile) {
    return true;
  }

  // Auth-related files
  if (fileName.includes('/auth/') || fileName.includes('\\auth\\')) {
    if (!context.AUTH) return false;
  }

  // Session-related files
  if (fileName.includes('/session/') || fileName.includes('\\session\\')) {
    if (!context.AUTH_SESSIONS) return false;
  }

  // User module (only with auth)
  if (fileName.includes('/user/') || fileName.includes('\\user\\')) {
    if (!context.AUTH) return false;
  }

  // Cache files (plugins/cache, not lib/cache)
  if (fileName.includes('/cache/') || fileName.includes('\\cache\\')) {
    if (!context.CACHE) return false;
  }

  // Queue files (queues/, plugins/bullboard)
  if ((fileName.includes('/queues/') || fileName.includes('\\queues\\')) && !fileName.includes('bullboard')) {
    if (!context.QUEUES) return false;
  }

  // BullBoard files
  if (fileName.includes('bullboard')) {
    if (!context.QUEUE_DASHBOARD) return false;
  }

  // Storage files (not lib/storage.ts)
  if ((fileName.includes('/storage/') || fileName.includes('\\storage\\')) && !isLibFile) {
    if (!context.STORAGE) return false;
  }

  // Email files (email/, not lib/email.ts)
  if ((fileName.includes('/email/') || fileName.includes('\\email\\')) && !isLibFile) {
    if (!context.EMAIL) return false;
  }

  // Realtime files
  if (fileName.includes('realtime')) {
    if (!context.REALTIME) return false;
  }

  // Admin files
  if (fileName.includes('admin')) {
    if (!context.ADMIN) return false;
  }

  // Security plugin
  if (fileName.includes('/security/') || fileName.includes('\\security\\')) {
    if (!context.SECURITY) return false;
  }

  return true;
}

// Register custom Handlebars helpers
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('or', function (...args) {
  // Remove the options object (last argument)
  args.pop();
  return args.some((arg) => !!arg);
});

Handlebars.registerHelper('and', function (...args) {
  // Remove the options object (last argument)
  args.pop();
  return args.every((arg) => !!arg);
});

Handlebars.registerHelper('not', function (value) {
  return !value;
});
