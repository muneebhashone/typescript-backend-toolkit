import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import type { ProjectConfig } from '../types/config.types.js';
import {
  createTemplateContext,
  renderTemplate,
  shouldIncludeFile,
} from '../utils/template.engine.js';
import { ensureDir, writeFile, readFile, pathExists, copyFile } from '../utils/file.utils.js';
import {
  generatePackageJson,
  generateEnvExample,
  generateGitignore,
  generateReadme,
} from './config.generator.js';
import {
  installDependencies,
  initGitRepository,
  createInitialCommit,
} from '../utils/package-manager.js';

export async function generateProject(
  targetDir: string,
  config: ProjectConfig,
): Promise<void> {
  const context = createTemplateContext(config);
  const spinner = ora();

  try {
    // Step 1: Create target directory
    spinner.start('Creating project directory...');
    await ensureDir(targetDir);
    spinner.succeed('Project directory created');

    // Step 2: Generate configuration files
    spinner.start('Generating configuration files...');
    await generatePackageJson(targetDir, config, context);
    await generateEnvExample(targetDir, config, context);
    await generateGitignore(targetDir);
    await generateReadme(targetDir, config, context);
    spinner.succeed('Configuration files generated');

    // Step 3: Copy and process template files
    spinner.start('Copying template files...');
    await copyTemplateFiles(targetDir, config, context);
    spinner.succeed('Template files copied');

    // Step 4: Install dependencies (if not skipped)
    if (!config.skipInstall) {
      spinner.start(`Installing dependencies with ${config.packageManager}...`);
      await installDependencies(targetDir, config.packageManager);
      spinner.succeed('Dependencies installed');
    }

    // Step 5: Initialize git (if not skipped)
    if (!config.skipGit) {
      spinner.start('Initializing git repository...');
      await initGitRepository(targetDir);
      await createInitialCommit(targetDir);
      spinner.succeed('Git repository initialized');
    }

    // Success message
    console.log('');
    console.log(chalk.green.bold('✓ Success! Your project is ready.'));
    console.log('');
    console.log(chalk.cyan('Next steps:'));
    console.log('');
    console.log(`  cd ${config.projectName}`);

    if (config.skipInstall) {
      console.log(`  ${config.packageManager} install`);
    }

    console.log('  cp .env.example .env.development');
    console.log('  # Update .env.development with your configuration');
    console.log(`  ${config.packageManager} dev`);
    console.log('');
    console.log(chalk.cyan('Documentation:'));
    console.log('  http://localhost:3000/docs - API Documentation');

    if (context.OBSERVABILITY_FULL) {
      console.log('  http://localhost:3000/ops/health - Health Check');
    }

    if (context.ADMIN) {
      console.log('  http://localhost:3000/admin - Admin Panel');
    }

    if (context.QUEUE_DASHBOARD) {
      console.log('  http://localhost:3000/queues - Queue Dashboard');
    }

    console.log('');
    console.log(chalk.yellow('Happy coding! 🚀'));
    console.log('');
    console.log(
      chalk.dim(
        'If you find this toolkit helpful, please consider starring the repo:',
      ),
    );
    console.log(
      chalk.cyan('https://github.com/muneebhashone/typescript-backend-toolkit'),
    );
    console.log('');
  } catch (error) {
    spinner.fail('Project generation failed');
    throw error;
  }
}

async function copyTemplateFiles(
  targetDir: string,
  config: ProjectConfig,
  context: any,
): Promise<void> {
  // Get the templates directory - always relative to this module file
  // Handle Windows file:/// URLs correctly
  const currentFileUrl = new URL(import.meta.url);
  let currentFilePath = currentFileUrl.pathname;
  // Remove leading slash on Windows (e.g., /C:/... -> C:/...)
  if (process.platform === 'win32' && currentFilePath.startsWith('/')) {
    currentFilePath = currentFilePath.slice(1);
  }

  // In development: src/generators/project.generator.ts -> ../../templates
  // In production: dist/cli.js (bundled) -> ../templates
  // Check if we're running from dist (production) or src (development)
  const isProduction = currentFilePath.includes('/dist/') || currentFilePath.includes('\\dist\\');
  const templateBaseDir = isProduction
    ? path.join(path.dirname(currentFilePath), '../templates')
    : path.join(path.dirname(currentFilePath), '../../templates');

  // Check if templates directory exists
  const templatesExist = await pathExists(templateBaseDir);

  if (!templatesExist) {
    // Templates not extracted yet - create placeholder notice
    const noticePath = path.join(targetDir, 'SETUP_NOTICE.md');
    await writeFile(
      noticePath,
      `# Setup Notice

This project was scaffolded with create-tbk-app.

The template extraction is still in progress. Please copy files manually from the main toolkit for now.

Selected preset: ${config.preset}
Selected features: ${JSON.stringify(context, null, 2)}
`,
    );
    return;
  }

  // Copy base templates (always included)
  const baseDir = path.join(templateBaseDir, 'base');
  if (await pathExists(baseDir)) {
    await copyAndRenderDirectory(baseDir, targetDir, context);
  }

  // Conditionally copy feature templates
  const features = [
    { enabled: context.AUTH, dir: 'auth' },
    { enabled: context.SECURITY, dir: 'security' },
    { enabled: context.OBSERVABILITY_FULL, dir: 'observability' },
    { enabled: context.CACHE, dir: 'cache' },
    { enabled: context.QUEUES, dir: 'queues' },
    { enabled: context.QUEUE_DASHBOARD, dir: 'bullboard' },
    { enabled: context.STORAGE, dir: 'storage' },
    { enabled: context.EMAIL, dir: 'email' },
    { enabled: context.REALTIME, dir: 'realtime' },
    { enabled: context.ADMIN, dir: 'admin' },
  ];

  for (const feature of features) {
    if (feature.enabled) {
      const featureDir = path.join(templateBaseDir, feature.dir);
      if (await pathExists(featureDir)) {
        await copyAndRenderDirectory(featureDir, targetDir, context);
      }
    }
  }

  if (context.AGENT_CLAUDE) {
    await copyClaudeCommandsIfAvailable(targetDir, templateBaseDir);
  }

  // Copy selected modules
  const modules = [
    { enabled: context.MODULE_UPLOAD, dir: 'modules/upload' },
    { enabled: context.MODULE_HEALTHCHECK, dir: 'modules/healthcheck' },
  ];

  for (const module of modules) {
    if (module.enabled) {
      const moduleDir = path.join(templateBaseDir, module.dir);
      if (await pathExists(moduleDir)) {
        await copyAndRenderDirectory(moduleDir, targetDir, context);
      }
    }
  }
}

async function copyAndRenderDirectory(
  sourceDir: string,
  targetDir: string,
  context: any,
): Promise<void> {
  const items = await fs.readdir(sourceDir);

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const stats = await fs.stat(sourcePath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      const targetSubDir = path.join(targetDir, item);
      await copyAndRenderDirectory(sourcePath, targetSubDir, context);
    } else {
      // Check if file should be included based on path
      if (!shouldIncludeFile(sourcePath, context)) {
        continue;
      }

      // Determine target path (remove .hbs extension if present)
      let targetPath = path.join(targetDir, item);
      const isHandlebarsTemplate = item.endsWith('.hbs');
      if (isHandlebarsTemplate) {
        targetPath = targetPath.slice(0, -4); // Remove .hbs extension
      }

      // Process file
      if (isHandlebarsTemplate) {
        // Read template, render with Handlebars, write output
        const templateContent = await fs.readFile(sourcePath, 'utf-8');
        try {
          const rendered = renderTemplate(templateContent, context);
          await writeFile(targetPath, rendered);
        } catch (error) {
          throw new Error(`Failed to render template ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Direct copy for non-template files
        await copyFile(sourcePath, targetPath);
      }
    }
  }
}

async function copyClaudeCommandsIfAvailable(
  targetDir: string,
  templateBaseDir: string,
): Promise<void> {
  const targetCommandsDir = path.join(targetDir, '.claude', 'commands');
  const candidateSources = [
    path.resolve(templateBaseDir, '..', '..', '..', '.claude', 'commands'),
    path.resolve(process.cwd(), '.claude', 'commands'),
  ];

  for (const source of candidateSources) {
    if (!(await pathExists(source))) {
      continue;
    }

    await fs.ensureDir(targetCommandsDir);
    await fs.emptyDir(targetCommandsDir);
    await fs.copy(source, targetCommandsDir, { overwrite: true, errorOnExist: false });
    return;
  }
}
