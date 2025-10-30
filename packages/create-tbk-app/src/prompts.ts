import inquirer from 'inquirer';
import type {
  ProjectConfig,
  PresetType,
  AuthType,
  CacheProvider,
  StorageProvider,
  EmailProvider,
  SessionDriver,
  PackageManager,
} from './types/config.types.js';
import { PRESETS, getPresetChoices } from './constants/presets.js';

export async function promptForProjectConfig(projectName?: string): Promise<ProjectConfig> {
  console.log('\n🚀 Welcome to create-tbk-app!\n');

  // Step 1: Project name
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'What is your project named?',
      default: projectName || 'my-backend',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-_]+$/.test(input)) {
          return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    },
  ]);

  // Step 2: Preset selection
  const { preset } = await inquirer.prompt<{ preset: PresetType }>([
    {
      type: 'list',
      name: 'preset',
      message: 'Which preset would you like to use?',
      choices: getPresetChoices(),
    },
  ]);

  // If not custom, use preset config
  if (preset !== 'custom') {
    const presetConfig = PRESETS[preset].config;
    const { packageManager, skipGit, skipInstall } = await promptForBasicOptions();

    return {
      projectName: name,
      preset,
      ...presetConfig,
      packageManager,
      skipGit,
      skipInstall,
    } as any;
  }

  // Custom configuration - ask detailed questions
  const customConfig = await promptForCustomConfig();
  const { packageManager, skipGit, skipInstall } = await promptForBasicOptions();

  return {
    projectName: name,
    preset: 'custom',
    ...customConfig,
    packageManager,
    skipGit,
    skipInstall,
  };
}

async function promptForCustomConfig() {
  console.log('\n📝 Let\'s customize your backend...\n');

  // Authentication
  const { auth } = await inquirer.prompt<{ auth: AuthType }>([
    {
      type: 'list',
      name: 'auth',
      message: 'Authentication system:',
      choices: [
        { name: 'None - No authentication', value: 'none' },
        { name: 'JWT - Token-based auth', value: 'jwt' },
        { name: 'JWT + Sessions - Token + session management', value: 'jwt-sessions' },
      ],
    },
  ]);

  let sessionDriver: SessionDriver | undefined;
  if (auth === 'jwt-sessions') {
    const result = await inquirer.prompt<{ sessionDriver: SessionDriver }>([
      {
        type: 'list',
        name: 'sessionDriver',
        message: 'Session storage:',
        choices: [
          { name: 'MongoDB - Store sessions in MongoDB', value: 'mongo' },
          { name: 'Redis - Store sessions in Redis (faster)', value: 'redis' },
        ],
      },
    ]);
    sessionDriver = result.sessionDriver;
  }

  // Google OAuth
  let googleOAuth = false;
  if (auth !== 'none') {
    const result = await inquirer.prompt<{ googleOAuth: boolean }>([
      {
        type: 'confirm',
        name: 'googleOAuth',
        message: 'Enable Google OAuth login?',
        default: false,
      },
    ]);
    googleOAuth = result.googleOAuth;
  }

  // Caching
  const { cache } = await inquirer.prompt<{ cache: CacheProvider }>([
    {
      type: 'list',
      name: 'cache',
      message: 'Caching strategy:',
      choices: [
        { name: 'None - No caching', value: 'none' },
        { name: 'Memory - In-memory cache (dev/testing)', value: 'memory' },
        { name: 'Redis - Redis cache (production)', value: 'redis' },
      ],
    },
  ]);

  // Background jobs
  const { queues } = await inquirer.prompt<{ queues: boolean }>([
    {
      type: 'confirm',
      name: 'queues',
      message: 'Enable background jobs? (BullMQ + Redis)',
      default: false,
    },
  ]);

  let queueDashboard = false;
  if (queues) {
    const result = await inquirer.prompt<{ queueDashboard: boolean }>([
      {
        type: 'confirm',
        name: 'queueDashboard',
        message: 'Include queue monitoring dashboard?',
        default: true,
      },
    ]);
    queueDashboard = result.queueDashboard;
  }

  // File storage
  const { storage } = await inquirer.prompt<{ storage: StorageProvider }>([
    {
      type: 'list',
      name: 'storage',
      message: 'File storage:',
      choices: [
        { name: 'None - No file uploads', value: 'none' },
        { name: 'Local - Store files on disk', value: 'local' },
        { name: 'AWS S3 - Amazon S3', value: 's3' },
        { name: 'Cloudflare R2 - S3-compatible', value: 'r2' },
      ],
    },
  ]);

  // Email
  const { email } = await inquirer.prompt<{ email: EmailProvider }>([
    {
      type: 'list',
      name: 'email',
      message: 'Email service:',
      choices: [
        { name: 'None - No email sending', value: 'none' },
        { name: 'Resend - Modern email API', value: 'resend' },
        { name: 'Mailgun - Transactional email', value: 'mailgun' },
        { name: 'SMTP - Traditional SMTP', value: 'smtp' },
      ],
    },
  ]);

  // Real-time
  const { realtime } = await inquirer.prompt<{ realtime: boolean }>([
    {
      type: 'confirm',
      name: 'realtime',
      message: 'Enable real-time features? (Socket.IO)',
      default: false,
    },
  ]);

  // Admin panel
  const { admin } = await inquirer.prompt<{ admin: boolean }>([
    {
      type: 'confirm',
      name: 'admin',
      message: 'Include admin panel? (Django-style auto-generated UI)',
      default: false,
    },
  ]);

  // Observability
  const { observability } = await inquirer.prompt<{ observability: 'basic' | 'full' }>([
    {
      type: 'list',
      name: 'observability',
      message: 'Observability level:',
      choices: [
        { name: 'Basic - Logging only', value: 'basic' },
        { name: 'Full - Logging + Metrics + Health checks', value: 'full' },
      ],
    },
  ]);

  return {
    auth,
    sessionDriver,
    googleOAuth,
    cache,
    queues,
    queueDashboard,
    storage,
    email,
    realtime,
    admin,
    observability,
  };
}

async function promptForBasicOptions() {
  const { packageManager } = await inquirer.prompt<{ packageManager: PackageManager }>([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: [
        { name: 'pnpm (recommended)', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
      ],
      default: 'pnpm',
    },
  ]);

  const { skipGit } = await inquirer.prompt<{ skipGit: boolean }>([
    {
      type: 'confirm',
      name: 'skipGit',
      message: 'Initialize git repository?',
      default: true,
      // Invert the response since we ask "Initialize" but store "skip"
      transformer: (value: boolean) => !value,
    },
  ]);

  const { skipInstall } = await inquirer.prompt<{ skipInstall: boolean }>([
    {
      type: 'confirm',
      name: 'skipInstall',
      message: 'Install dependencies now?',
      default: true,
      // Invert the response
      transformer: (value: boolean) => !value,
    },
  ]);

  return {
    packageManager,
    skipGit: !skipGit, // Invert for storage
    skipInstall: !skipInstall, // Invert for storage
  };
}
