import { Command } from 'commander';
import { createPluginAction } from './actions/plugin';
import { createMiddlewareAction } from './actions/middleware';
import { createModuleAction } from './actions/module';
import { createSeedAction } from './actions/seed';
import { createMakeSeederAction } from './actions/makeSeeder';
import { createMakeFactoryAction } from './actions/makeFactory';

const program = new Command();

program
  .name('tbk')
  .description('TypeScript Backend Toolkit CLI')
  .version('1.0.0');

program
  .command('generate:plugin <name>')
  .alias('g:plugin')
  .description('Generate a new plugin')
  .action(createPluginAction);

program
  .command('generate:middleware <name>')
  .alias('g:middleware')
  .description('Generate a new middleware')
  .action(createMiddlewareAction);

program
  .command('generate:module <name>')
  .alias('g:module')
  .description(
    'Generate a complete module with all files (dto, model, schema, services, controller, router)',
  )
  .option('-p, --path <path>', 'API path prefix', '/api')
  .action(createModuleAction);

// Seeder commands
program
  .command('seed')
  .description('Run database seeders')
  .option('-g, --group <group>', 'Group to run (base|dev|test|demo)', 'dev')
  .option('--only <names>', 'Comma separated seeder names')
  .option('--fresh', 'Drop involved collections before seeding')
  .option('--force', 'Force run in production')
  .option('--dry-run', 'Do not write, only log actions')
  .option(
    '--seed <number>',
    'Random seed for data generation',
    (v) => Number(v),
    1,
  )
  .option('--no-transaction', 'Disable transactions')
  .action(createSeedAction);

program
  .command('make:seeder <module>/<name>')
  .description('Scaffold a new module seeder')
  .action(createMakeSeederAction);

program
  .command('make:factory <module>/<name>')
  .description('Scaffold a new module factory')
  .action(createMakeFactoryAction);

program.parse();
