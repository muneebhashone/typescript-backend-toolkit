#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import { promptForProjectConfig } from './prompts.js';
import { generateProject } from './generators/project.generator.js';
import { validateProjectName, checkDirectoryExists } from './utils/validation.js';
import type { ProjectConfig } from './types/config.types.js';
import { PRESETS } from './constants/presets.js';

const program = new Command();

program
  .name('create-tbk-app')
  .description('Scaffold a TypeScript Backend Toolkit project')
  .version('0.1.0')
  .argument('[project-name]', 'Name of the project')
  .option('--preset <type>', 'Preset configuration (minimal, standard, full, custom)')
  .option('--auth <type>', 'Authentication type (none, jwt, jwt-sessions)')
  .option('--cache <provider>', 'Cache provider (none, memory, redis)')
  .option('--storage <provider>', 'Storage provider (none, local, s3, r2)')
  .option('--email <provider>', 'Email provider (none, resend, mailgun, smtp)')
  .option('--queues', 'Enable background jobs')
  .option('--realtime', 'Enable real-time features')
  .option('--admin', 'Include admin panel')
  .option('--pm <manager>', 'Package manager (pnpm, npm, yarn)')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip dependency installation')
  .action(async (projectName: string | undefined, options: any) => {
    try {
      console.log(chalk.bold.cyan('\n🚀 create-tbk-app\n'));

      // If flags are provided, use non-interactive mode
      if (options.preset || options.auth || options.cache) {
        await runNonInteractive(projectName, options);
      } else {
        // Interactive mode
        await runInteractive(projectName);
      }
    } catch (error: any) {
      console.error(chalk.red('\n✖ Error:'), error.message);
      process.exit(1);
    }
  });

async function runInteractive(projectName?: string) {
  // Prompt user for configuration
  const config = await promptForProjectConfig(projectName);

  // Validate project name
  const validation = validateProjectName(config.projectName);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  // Check if directory exists
  const targetDir = path.resolve(process.cwd(), config.projectName);
  const dirExists = await checkDirectoryExists(targetDir);

  if (dirExists) {
    throw new Error(
      `Directory "${config.projectName}" already exists and is not empty. Please choose a different name.`,
    );
  }

  // Generate project
  await generateProject(targetDir, config);
}

async function runNonInteractive(projectName: string | undefined, options: any) {
  if (!projectName) {
    throw new Error('Project name is required in non-interactive mode');
  }

  // Validate project name
  const validation = validateProjectName(projectName);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  // Build config from options
  const config: ProjectConfig = buildConfigFromOptions(projectName, options);

  // Check if directory exists
  const targetDir = path.resolve(process.cwd(), projectName);
  const dirExists = await checkDirectoryExists(targetDir);

  if (dirExists) {
    throw new Error(
      `Directory "${projectName}" already exists and is not empty. Please choose a different name.`,
    );
  }

  // Generate project
  await generateProject(targetDir, config);
}

function buildConfigFromOptions(projectName: string, options: any): ProjectConfig {
  // If preset is provided, start with preset config
  let baseConfig: Partial<ProjectConfig> = {};

  if (options.preset && options.preset !== 'custom' && PRESETS[options.preset]) {
    baseConfig = { ...PRESETS[options.preset].config };
  }

  // Override with CLI options
  return {
    projectName,
    preset: options.preset || 'custom',
    auth: options.auth || baseConfig.auth || 'none',
    sessionDriver: baseConfig.sessionDriver,
    cache: options.cache || baseConfig.cache || 'none',
    queues: options.queues !== undefined ? options.queues : baseConfig.queues || false,
    storage: options.storage || baseConfig.storage || 'none',
    email: options.email || baseConfig.email || 'none',
    realtime: options.realtime !== undefined ? options.realtime : baseConfig.realtime || false,
    admin: options.admin !== undefined ? options.admin : baseConfig.admin || false,
    queueDashboard:
      baseConfig.queueDashboard !== undefined ? baseConfig.queueDashboard : false,
    observability: baseConfig.observability || 'basic',
    packageManager: options.pm || 'pnpm',
    skipGit: options.skipGit || false,
    skipInstall: options.skipInstall || false,
  };
}

program.parse();
