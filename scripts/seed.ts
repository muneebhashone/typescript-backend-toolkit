#!/usr/bin/env tsx

import { Command } from 'commander';
import { seeders } from '../src/seeders/DatabaseSeeder';
import { runSeeders } from '../src/seeders/runner';

const program = new Command();

program
  .name('seed')
  .description('Run database seeders')
  .option('-g, --group <group>', 'Group to run (base|dev|test|demo)', 'dev')
  .option('--only <names>', 'Comma separated seeder names')
  .option('--fresh', 'Drop involved collections before seeding')
  .option('--force', 'Force run in production')
  .option('--dry-run', 'Do not write, only log actions')
  .option('--seed <number>', 'Random seed for data generation', (v) => Number(v), 1)
  .option('--no-transaction', 'Disable transactions')
  .action(async (opts) => {
    const only = opts.only ? String(opts.only).split(',').map((s: string) => s.trim()) : undefined;

    try {
      await runSeeders(seeders, {
        group: opts.group,
        only,
        fresh: Boolean(opts.fresh),
        force: Boolean(opts.force),
        dryRun: Boolean(opts.dryRun),
        seed: Number(opts.seed) || 1,
        transaction: opts.transaction ?? true,
      });
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error((e as Error).message);
      process.exit(1);
    }
  });

program.parse();

