#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import {
  cancel,
  confirm,
  select,
  spinner,
  text,
  isCancel,
} from '@clack/prompts';
import {
  collectProjectConfig,
  renderSummary,
  type PromptDefaults,
} from './prompts.js';
import { generateProject } from './generators/project.generator.js';
import {
  validateProjectName,
  checkDirectoryExists,
} from './utils/validation.js';
import type {
  AgentId,
  AuthType,
  CacheProvider,
  EmailProvider,
  ModuleId,
  ObservabilityLevel,
  PackageManager,
  PresetType,
  ProjectConfig,
  SessionDriver,
  StorageProvider,
} from './types/config.types.js';
import { PRESETS } from './constants/presets.js';

interface CliOptions {
  preset?: string;
  auth?: string;
  sessionDriver?: string;
  cache?: string;
  storage?: string;
  email?: string;
  queues?: boolean;
  queueDashboard?: boolean;
  realtime?: boolean;
  admin?: boolean;
  googleOauth?: boolean;
  observability?: string;
  pm?: string;
  skipGit?: boolean;
  skipInstall?: boolean;
  agents?: string;
  modules?: string;
  yes?: boolean;
  force?: boolean;
}

const program = new Command();

program
  .name('create-tbk-app')
  .description('Scaffold a TypeScript Backend Toolkit project')
  .version('0.1.0')
  .argument('[project-name]', 'Name of the project')
  .option(
    '--preset <type>',
    'Preset configuration (minimal, standard, full, custom)',
  )
  .option('--auth <type>', 'Authentication type (none, jwt, jwt-sessions)')
  .option('--session-driver <driver>', 'Session storage driver (mongo, redis)')
  .option('--cache <provider>', 'Cache provider (none, memory, redis)')
  .option('--storage <provider>', 'Storage provider (none, local, s3, r2)')
  .option('--email <provider>', 'Email provider (none, resend, mailgun, smtp)')
  .option('--queues', 'Enable background jobs')
  .option('--no-queues', 'Disable background jobs')
  .option('--queue-dashboard', 'Include queue monitoring dashboard')
  .option('--no-queue-dashboard', 'Disable queue monitoring dashboard')
  .option('--realtime', 'Enable real-time features')
  .option('--no-realtime', 'Disable real-time features')
  .option('--admin', 'Include admin panel')
  .option('--no-admin', 'Disable admin panel')
  .option('--google-oauth', 'Enable Google OAuth login')
  .option('--observability <level>', 'Observability level (basic, full)')
  .option('--pm <manager>', 'Package manager (pnpm, npm, yarn)')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip dependency installation')
  .option('--agents <agents>', 'Comma-separated AI agents/IDEs (claude,cursor,other)')
  .option('--modules <modules>', 'Comma-separated modules (upload,healthcheck)')
  .option('-y, --yes', 'Skip prompts and accept defaults')
  .option('--force', 'Overwrite target directory without prompting')
  .action(async (projectName: string | undefined, options: CliOptions) => {
    try {
      console.log(chalk.bold.cyan('\n🚀 create-tbk-app\n'));

      const normalized = normalizeOptions(options);
      const interactive = shouldRunInteractive(projectName, normalized);

      if (interactive) {
        await runInteractiveFlow(projectName, normalized);
      } else {
        await runNonInteractiveFlow(projectName, normalized);
      }
    } catch (error: unknown) {
      if (isUserCancelled(error)) {
        process.exit(0);
      }

      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('\n✖ Error:'), message);
      process.exit(1);
    }
  });

async function runInteractiveFlow(
  projectName: string | undefined,
  options: NormalizedOptions,
) {
  const defaults = mapOptionsToDefaults(projectName, options);
  const collected = await collectProjectConfig(projectName, defaults);
  const validatedConfig = await validateAndAdjustConfig(
    collected,
    options,
    true,
  );
  await finalizeAndGenerate(validatedConfig, options, true);
}

async function runNonInteractiveFlow(
  projectName: string | undefined,
  options: NormalizedOptions,
) {
  if (!projectName) {
    throw new Error('Project name is required when skipping prompts.');
  }

  const config = buildConfigFromOptions(projectName, options);
  const validatedConfig = await validateAndAdjustConfig(config, options, false);
  await finalizeAndGenerate(validatedConfig, options, false);
}

interface NormalizedOptions {
  preset?: PresetType;
  auth?: AuthType;
  sessionDriver?: SessionDriver;
  cache?: CacheProvider;
  storage?: StorageProvider;
  email?: EmailProvider;
  queues?: boolean;
  queueDashboard?: boolean;
  realtime?: boolean;
  admin?: boolean;
  googleOAuth?: boolean;
  observability?: ObservabilityLevel;
  packageManager?: PackageManager;
  skipGit?: boolean;
  skipInstall?: boolean;
  agents?: AgentId[];
  modules?: ModuleId[];
  yes: boolean;
  force: boolean;
}

const SAFE_NAME_REGEX = /^[a-z0-9-_]+$/;

function normalizeOptions(options: CliOptions): NormalizedOptions {
  return {
    preset: parseChoice(
      options.preset,
      ['minimal', 'standard', 'full', 'custom'],
      'preset',
    ),
    auth: parseChoice(options.auth, ['none', 'jwt', 'jwt-sessions'], 'auth'),
    sessionDriver: parseChoice(
      options.sessionDriver,
      ['mongo', 'redis'],
      'session-driver',
    ),
    cache: parseChoice(options.cache, ['none', 'memory', 'redis'], 'cache'),
    storage: parseChoice(
      options.storage,
      ['none', 'local', 's3', 'r2'],
      'storage',
    ),
    email: parseChoice(
      options.email,
      ['none', 'resend', 'mailgun', 'smtp'],
      'email',
    ),
    queues: getBooleanOption(options, 'queues'),
    queueDashboard: getBooleanOption(options, 'queueDashboard'),
    realtime: getBooleanOption(options, 'realtime'),
    admin: getBooleanOption(options, 'admin'),
    googleOAuth: getBooleanOption(options, 'googleOauth'),
    observability: parseChoice(
      options.observability,
      ['basic', 'full'],
      'observability',
    ),
    packageManager: parseChoice(options.pm, ['pnpm', 'npm', 'yarn'], 'pm'),
    skipGit: getBooleanOption(options, 'skipGit'),
    skipInstall: getBooleanOption(options, 'skipInstall'),
    agents: parseAgents(options.agents),
    modules: parseModules(options.modules),
    yes: options.yes ?? false,
    force: options.force ?? false,
  };
}

function shouldRunInteractive(
  projectName: string | undefined,
  options: NormalizedOptions,
) {
  if (options.yes) {
    return false;
  }

  if (!projectName) {
    return true;
  }

  return !hasFullConfig(projectName, options);
}

function hasFullConfig(
  projectName: string | undefined,
  options: NormalizedOptions,
) {
  if (!projectName || !options.preset) {
    return false;
  }

  if (!hasBasicFlags(options)) {
    return false;
  }

  if (options.preset !== 'custom') {
    return true;
  }

  return hasCustomFlags(options);
}

function hasBasicFlags(options: NormalizedOptions) {
  return [options.packageManager, options.skipGit, options.skipInstall].every(
    (value) => value !== undefined,
  );
}

function hasCustomFlags(options: NormalizedOptions) {
  const choiceFields = [
    options.auth,
    options.cache,
    options.storage,
    options.email,
    options.observability,
  ];
  if (choiceFields.some((value) => value === undefined)) {
    return false;
  }

  if (options.auth === 'jwt-sessions' && !options.sessionDriver) {
    return false;
  }

  const booleanFields = [options.queues, options.realtime, options.admin];
  if (booleanFields.some((value) => typeof value !== 'boolean')) {
    return false;
  }

  if (options.queues && typeof options.queueDashboard !== 'boolean') {
    return false;
  }

  return true;
}

function mapOptionsToDefaults(
  projectName: string | undefined,
  options: NormalizedOptions,
): PromptDefaults {
  return {
    projectName,
    preset: options.preset,
    auth: options.auth,
    sessionDriver: options.sessionDriver,
    googleOAuth: options.googleOAuth,
    cache: options.cache,
    queues: options.queues,
    queueDashboard: options.queueDashboard,
    storage: options.storage,
    email: options.email,
    realtime: options.realtime,
    admin: options.admin,
    observability: options.observability,
    agents: options.agents,
    modules: options.modules,
    packageManager: options.packageManager,
    skipGit: options.skipGit,
    skipInstall: options.skipInstall,
  };
}

async function validateAndAdjustConfig(
  config: ProjectConfig,
  options: NormalizedOptions,
  interactive: boolean,
): Promise<ProjectConfig> {
  const validation = validateProjectName(config.projectName);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  // Validate upload module requires storage provider
  if (config.modules?.includes('upload') && config.storage === 'none') {
    throw new Error(
      'The upload module requires a storage provider. Please select a storage provider (local, s3, or r2) when using the upload module.',
    );
  }

  return resolveProjectDirectory(config, options, interactive);
}

async function resolveProjectDirectory(
  config: ProjectConfig,
  options: NormalizedOptions,
  interactive: boolean,
): Promise<ProjectConfig> {
  let projectName = config.projectName;

  while (true) {
    const targetDir = getTargetDirectory(projectName);
    const dirHasContent = await checkDirectoryExists(targetDir);

    if (!dirHasContent) {
      if (options.force) {
        await fs.ensureDir(targetDir);
      }

      if (projectName !== config.projectName) {
        return { ...config, projectName };
      }

      return config;
    }

    if (options.force) {
      await fs.emptyDir(targetDir);
      return { ...config, projectName };
    }

    if (!interactive) {
      throw new Error(
        `Directory "${projectName}" already exists and is not empty. Use --force to overwrite or choose a different name.`,
      );
    }

    const resolution = ensurePromptResult<string>(
      await select({
        message: `Directory "${projectName}" already exists and is not empty.`,
        options: [
          { label: 'Overwrite existing directory', value: 'overwrite' },
          { label: 'Choose a different project name', value: 'rename' },
          { label: 'Cancel setup', value: 'cancel' },
        ],
      }),
    );

    if (resolution === 'overwrite') {
      await fs.emptyDir(targetDir);
      return { ...config, projectName };
    }

    if (resolution === 'cancel') {
      cancel('Setup cancelled.');
      throw new Error('User cancelled');
    }

    const nextName = ensurePromptResult<string>(
      await text({
        message: 'Enter a new project name',
        initialValue: `${projectName}-1`,
        validate: (input) => {
          const result = validateProjectName(input.trim());
          if (!result.valid) {
            return result.error || 'Invalid project name';
          }
          if (!SAFE_NAME_REGEX.test(input.trim())) {
            return 'Use lowercase letters, numbers, hyphens, or underscores only';
          }
          return undefined;
        },
      }),
    ).trim();

    projectName = nextName;
  }
}

async function finalizeAndGenerate(
  config: ProjectConfig,
  options: NormalizedOptions,
  interactive: boolean,
) {
  renderSummary(config);

  if (!options.yes && interactive) {
    const proceed = ensurePromptResult<boolean>(
      await confirm({
        message: 'Create project with these settings?',
        initialValue: true,
      }),
    );

    if (!proceed) {
      cancel('Setup cancelled.');
      throw new Error('User cancelled');
    }
  }

  const targetDir = getTargetDirectory(config.projectName);
  const spin = spinner();

  spin.start('Scaffolding project files...');

  try {
    await generateProject(targetDir, config);
    spin.stop('Project created successfully ✅');
  } catch (error) {
    spin.stop('Failed to scaffold project');
    throw error;
  }
}

function buildConfigFromOptions(
  projectName: string,
  options: NormalizedOptions,
): ProjectConfig {
  const preset =
    options.preset && PRESETS[options.preset] ? options.preset : 'custom';
  const presetConfig = preset !== 'custom' ? PRESETS[preset].config : undefined;

  const auth = resolveOption<AuthType>(
    options.auth,
    presetConfig?.auth ?? 'none',
    'auth',
  );

  const sessionDriver = options.sessionDriver ?? presetConfig?.sessionDriver;
  if (auth === 'jwt-sessions' && !sessionDriver) {
    throw new Error('Session driver is required for auth type "jwt-sessions".');
  }

  const cache = resolveOption<CacheProvider>(
    options.cache,
    presetConfig?.cache ?? 'none',
    'cache',
  );
  const queues = resolveBooleanOption(
    options.queues,
    presetConfig?.queues ?? false,
  );
  const queueDashboard = queues
    ? resolveBooleanOption(
        options.queueDashboard,
        presetConfig?.queueDashboard ?? true,
      )
    : false;
  const storage = resolveOption<StorageProvider>(
    options.storage,
    presetConfig?.storage ?? 'none',
    'storage',
  );
  const email = resolveOption<EmailProvider>(
    options.email,
    presetConfig?.email ?? 'none',
    'email',
  );
  const realtime = resolveBooleanOption(
    options.realtime,
    presetConfig?.realtime ?? false,
  );
  const admin = resolveBooleanOption(
    options.admin,
    presetConfig?.admin ?? false,
  );
  const observability = resolveOption<ObservabilityLevel>(
    options.observability,
    presetConfig?.observability ?? 'basic',
    'observability',
  );

  return {
    projectName,
    preset,
    auth,
    sessionDriver,
    googleOAuth: resolveBooleanOption(
      options.googleOAuth,
      presetConfig?.googleOAuth ?? false,
    ),
    cache,
    queues,
    queueDashboard,
    storage,
    email,
    realtime,
    admin,
    observability,
    agents: options.agents ?? presetConfig?.agents ?? [],
    modules: options.modules ?? presetConfig?.modules ?? [],
    packageManager: options.packageManager ?? 'pnpm',
    skipGit: resolveBooleanOption(options.skipGit, false),
    skipInstall: resolveBooleanOption(options.skipInstall, false),
  };
}

function parseChoice<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  flagName: string,
): T | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase() as T;
  if (!allowed.includes(normalized)) {
    throw new Error(
      `Invalid value "${value}" for --${flagName}. Allowed values: ${allowed.join(', ')}`,
    );
  }

  return normalized;
}

function parseAgents(value: string | undefined): AgentId[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const allowed: AgentId[] = ['claude', 'cursor', 'other'];
  const selections = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  if (selections.length === 0) {
    return [];
  }

  const invalid = selections.filter(
    (item): item is string => !allowed.includes(item as AgentId),
  );

  if (invalid.length > 0) {
    throw new Error(
      `Invalid value(s) "${invalid.join(', ')}" for --agents. Allowed values: ${allowed.join(', ')}`,
    );
  }

  const unique = Array.from(new Set(selections)) as AgentId[];
  return unique;
}

function parseModules(value: string | undefined): ModuleId[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const allowed: ModuleId[] = ['upload', 'healthcheck'];
  const selections = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);

  if (selections.length === 0) {
    return [];
  }

  const invalid = selections.filter(
    (item): item is string => !allowed.includes(item as ModuleId),
  );

  if (invalid.length > 0) {
    throw new Error(
      `Invalid value(s) "${invalid.join(', ')}" for --modules. Allowed values: ${allowed.join(', ')}`,
    );
  }

  const unique = Array.from(new Set(selections)) as ModuleId[];
  return unique;
}

function getBooleanOption(options: CliOptions, key: keyof CliOptions) {
  const value = options[key];
  return typeof value === 'boolean' ? value : undefined;
}

function resolveOption<T>(
  value: T | undefined,
  fallback: T | undefined,
  fieldName: string,
): T {
  if (value !== undefined) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required option --${fieldName}.`);
}

function resolveBooleanOption(
  value: boolean | undefined,
  fallback: boolean,
): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function ensurePromptResult<T>(result: T | symbol): T {
  if (isCancel(result)) {
    cancel('Setup cancelled.');
    throw new Error('User cancelled');
  }

  return result as T;
}

function getTargetDirectory(projectName: string): string {
  if (!SAFE_NAME_REGEX.test(projectName)) {
    throw new Error(
      'Project name may only include lowercase letters, numbers, hyphens, and underscores.',
    );
  }

  return path.resolve(process.cwd(), projectName);
}

function isUserCancelled(error: unknown): boolean {
  return error instanceof Error && error.message === 'User cancelled';
}

program.parse();
