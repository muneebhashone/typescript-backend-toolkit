export type PresetType = 'minimal' | 'standard' | 'full' | 'custom';

export type AuthType = 'none' | 'jwt' | 'jwt-sessions';

export type CacheProvider = 'none' | 'memory' | 'redis';

export type StorageProvider = 'none' | 'local' | 's3' | 'r2';

export type EmailProvider = 'none' | 'resend' | 'mailgun' | 'smtp';

export type SessionDriver = 'mongo' | 'redis';

export type ObservabilityLevel = 'basic' | 'full';

export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export interface ProjectConfig {
  projectName: string;
  preset: PresetType;
  auth: AuthType;
  sessionDriver?: SessionDriver;
  googleOAuth: boolean;
  cache: CacheProvider;
  queues: boolean;
  storage: StorageProvider;
  email: EmailProvider;
  realtime: boolean;
  admin: boolean;
  queueDashboard: boolean;
  observability: ObservabilityLevel;
  packageManager: PackageManager;
  skipGit: boolean;
  skipInstall: boolean;
}

export interface TemplateContext {
  PROJECT_NAME: string;
  PROJECT_NAME_KEBAB: string;
  PROJECT_NAME_PASCAL: string;

  // Feature flags
  AUTH: boolean;
  AUTH_JWT: boolean;
  AUTH_SESSIONS: boolean;
  AUTH_GOOGLE_OAUTH: boolean;
  SESSION_DRIVER: SessionDriver | null;

  CACHE: boolean;
  CACHE_MEMORY: boolean;
  CACHE_REDIS: boolean;

  QUEUES: boolean;
  QUEUE_DASHBOARD: boolean;

  STORAGE: boolean;
  STORAGE_LOCAL: boolean;
  STORAGE_S3: boolean;
  STORAGE_R2: boolean;
  STORAGE_PROVIDER: StorageProvider | null;

  EMAIL: boolean;
  EMAIL_RESEND: boolean;
  EMAIL_MAILGUN: boolean;
  EMAIL_SMTP: boolean;
  EMAIL_PROVIDER: EmailProvider | null;

  REALTIME: boolean;
  ADMIN: boolean;

  OBSERVABILITY_BASIC: boolean;
  OBSERVABILITY_FULL: boolean;

  SECURITY: boolean;

  PRESET: PresetType;
}

export interface PresetConfig {
  name: string;
  description: string;
  config: Omit<ProjectConfig, 'projectName' | 'preset' | 'packageManager' | 'skipGit' | 'skipInstall' | 'googleOAuth'> & { googleOAuth?: boolean };
}
