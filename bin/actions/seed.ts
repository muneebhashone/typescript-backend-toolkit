import { seeders } from '../../src/seeders/registry';
import { runSeeders } from '../../src/seeders/runner';

export const createSeedAction = async (opts: {
  group: string;
  only: string;
  fresh: boolean;
  force: boolean;
  dryRun: boolean;
  seed: number;
  transaction: boolean;
}) => {
  const only = opts.only
    ? String(opts.only)
        .split(',')
        .map((s) => s.trim())
    : undefined;

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
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};
