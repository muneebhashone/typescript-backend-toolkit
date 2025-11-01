import {
  confirm,
  intro,
  isCancel,
  note,
  select,
  text,
  cancel,
} from '@clack/prompts';
import type {
  AuthType,
  CacheProvider,
  EmailProvider,
  ObservabilityLevel,
  PackageManager,
  PresetType,
  ProjectConfig,
  SessionDriver,
  StorageProvider,
} from './types/config.types.js';
import { PRESETS, getPresetChoices } from './constants/presets.js';

type BooleanLike = boolean | undefined;
type Choice<T extends string> = { value: T; label: string; hint?: string };

const projectNameRegex = /^[a-z0-9-_]+$/;

export interface PromptDefaults {
  projectName?: string;
  preset?: PresetType;
  auth?: AuthType;
  sessionDriver?: SessionDriver;
  googleOAuth?: BooleanLike;
  cache?: CacheProvider;
  queues?: BooleanLike;
  queueDashboard?: BooleanLike;
  storage?: StorageProvider;
  email?: EmailProvider;
  realtime?: BooleanLike;
  admin?: BooleanLike;
  observability?: ObservabilityLevel;
  packageManager?: PackageManager;
  skipGit?: BooleanLike;
  skipInstall?: BooleanLike;
}

export async function collectProjectConfig(
  projectNameArg?: string,
  defaults: PromptDefaults = {},
): Promise<ProjectConfig> {
  intro('create-tbk-app');

  const projectName = ensureNotCancelled(
    await text({
      message: 'What is your project named?',
      initialValue: projectNameArg || defaults.projectName || 'my-backend',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Project name is required';
        }
        if (!projectNameRegex.test(input)) {
          return 'Use lowercase letters, numbers, hyphens, or underscores only';
        }
        return undefined;
      },
    }),
  );

  const preset = await promptSelectValue<PresetType>({
    message: 'Which preset would you like to use?',
    options: getPresetChoices().map((choice) => ({
      value: choice.value as PresetType,
      label: choice.name,
    })),
    initialValue: defaults.preset,
  });

  let customConfig: Partial<ProjectConfig> = {};

  if (preset === 'custom') {
    customConfig = await collectCustomConfig(defaults);
  } else {
    customConfig = { ...PRESETS[preset].config };
  }

  const basicOptions = await collectBasicOptions(defaults);

  const finalConfig: ProjectConfig = {
    projectName,
    preset,
    auth: customConfig.auth!,
    sessionDriver: customConfig.sessionDriver,
    googleOAuth: customConfig.googleOAuth ?? false,
    cache: customConfig.cache!,
    queues: customConfig.queues ?? false,
    queueDashboard: customConfig.queueDashboard ?? false,
    storage: customConfig.storage!,
    email: customConfig.email!,
    realtime: customConfig.realtime ?? false,
    admin: customConfig.admin ?? false,
    observability: customConfig.observability!,
    packageManager: basicOptions.packageManager,
    skipGit: basicOptions.skipGit,
    skipInstall: basicOptions.skipInstall,
  };

  return finalConfig;
}

export function renderSummary(config: ProjectConfig) {
  note(
    'Project configuration',
    [
      `Name: ${config.projectName}`,
      `Preset: ${config.preset}`,
      `Auth: ${config.auth}${config.auth === 'jwt-sessions' && config.sessionDriver ? ` (${config.sessionDriver})` : ''}`,
      `Google OAuth: ${config.googleOAuth ? 'yes' : 'no'}`,
      `Cache: ${config.cache}`,
      `Queues: ${config.queues ? 'enabled' : 'disabled'}`,
      `Queue dashboard: ${config.queueDashboard ? 'yes' : 'no'}`,
      `Storage: ${config.storage}`,
      `Email: ${config.email}`,
      `Realtime: ${config.realtime ? 'enabled' : 'disabled'}`,
      `Admin: ${config.admin ? 'enabled' : 'disabled'}`,
      `Observability: ${config.observability}`,
      `Package manager: ${config.packageManager}`,
      `Initialize git repo: ${config.skipGit ? 'no' : 'yes'}`,
      `Install dependencies: ${config.skipInstall ? 'later' : 'now'}`,
    ].join('\n'),
  );
}

async function collectCustomConfig(
  defaults: PromptDefaults,
): Promise<Partial<ProjectConfig>> {
  note('Custom configuration', 'Let’s pick the features you need.');

  const auth = await promptSelectValue<AuthType>({
    message: 'Authentication system',
    options: [
      { label: 'None – No authentication', value: 'none' },
      { label: 'JWT – Token-based auth', value: 'jwt' },
      {
        label: 'JWT + Sessions – Token + session management',
        value: 'jwt-sessions',
      },
    ],
    initialValue: defaults.auth ?? 'none',
  });

  let sessionDriver: SessionDriver | undefined = defaults.sessionDriver;
  if (auth === 'jwt-sessions') {
    sessionDriver = await promptSelectValue<SessionDriver>({
      message: 'Session storage',
      options: [
        { label: 'MongoDB – Store sessions in MongoDB', value: 'mongo' },
        { label: 'Redis – Store sessions in Redis (faster)', value: 'redis' },
      ],
      initialValue: defaults.sessionDriver ?? 'redis',
    });
  }

  const googleOAuth =
    auth !== 'none'
      ? await promptConfirmValue(
          'Enable Google OAuth login?',
          Boolean(defaults.googleOAuth),
        )
      : false;

  const cache = await promptSelectValue<CacheProvider>({
    message: 'Caching strategy',
    options: [
      { label: 'None – No caching', value: 'none' },
      { label: 'Memory – In-memory cache (dev/testing)', value: 'memory' },
      { label: 'Redis – Redis cache (production)', value: 'redis' },
    ],
    initialValue: defaults.cache ?? 'none',
  });

  const queues = await promptConfirmValue(
    'Enable background jobs? (BullMQ + Redis)',
    Boolean(defaults.queues),
  );

  const queueDashboard = queues
    ? await promptConfirmValue(
        'Include queue monitoring dashboard?',
        defaults.queueDashboard ?? true,
      )
    : false;

  const storage = await promptSelectValue<StorageProvider>({
    message: 'File storage provider',
    options: [
      { label: 'None – No file uploads', value: 'none' },
      { label: 'Local – Store files on disk', value: 'local' },
      { label: 'AWS S3 – Amazon S3', value: 's3' },
      { label: 'Cloudflare R2 – S3 compatible', value: 'r2' },
    ],
    initialValue: defaults.storage ?? 'none',
  });

  const email = await promptSelectValue<EmailProvider>({
    message: 'Email service',
    options: [
      { label: 'None – No email sending', value: 'none' },
      { label: 'Resend – Modern email API', value: 'resend' },
      { label: 'Mailgun – Transactional email', value: 'mailgun' },
      { label: 'SMTP – Traditional SMTP', value: 'smtp' },
    ],
    initialValue: defaults.email ?? 'none',
  });

  const realtime = await promptConfirmValue(
    'Enable real-time features? (Socket.IO)',
    Boolean(defaults.realtime),
  );

  const admin = await promptConfirmValue(
    'Include admin panel? (auto-generated UI)',
    Boolean(defaults.admin),
  );

  const observability = await promptSelectValue<ObservabilityLevel>({
    message: 'Observability level',
    options: [
      { label: 'Basic – Logging only', value: 'basic' },
      { label: 'Full – Logging + metrics + health checks', value: 'full' },
    ],
    initialValue: defaults.observability ?? 'full',
  });

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
  } satisfies Partial<ProjectConfig>;
}

async function collectBasicOptions(defaults: PromptDefaults) {
  const packageManager = await promptSelectValue<PackageManager>({
    message: 'Package manager',
    options: [
      { label: 'pnpm (recommended)', value: 'pnpm' },
      { label: 'npm', value: 'npm' },
      { label: 'yarn', value: 'yarn' },
    ],
    initialValue: defaults.packageManager ?? 'pnpm',
  });

  const initializeGit = await promptConfirmValue(
    'Initialize a git repository?',
    !(defaults.skipGit ?? false),
  );

  const installDepsNow = await promptConfirmValue(
    'Install dependencies now?',
    !(defaults.skipInstall ?? false),
  );

  return {
    packageManager,
    skipGit: !initializeGit,
    skipInstall: !installDepsNow,
  } satisfies Pick<ProjectConfig, 'packageManager' | 'skipGit' | 'skipInstall'>;
}

async function promptSelectValue<T extends string>({
  message,
  options,
  initialValue,
}: {
  message: string;
  options: Choice<T>[];
  initialValue?: T;
}): Promise<T> {
  const selectPrompt = select as unknown as (opts: {
    message: string;
    options: Choice<T>[];
    initialValue?: T;
  }) => Promise<T | symbol>;

  const result = await selectPrompt({
    message,
    options,
    initialValue,
  });

  return ensureNotCancelled(result);
}

async function promptConfirmValue(
  message: string,
  initialValue: boolean,
): Promise<boolean> {
  const result = await confirm({
    message,
    initialValue,
  });

  return ensureNotCancelled(result);
}

function ensureNotCancelled<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Setup cancelled.');
    throw new Error('User cancelled');
  }

  return value as T;
}
