import path from 'path';
import { pathToFileURL } from 'url';

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
    // Dynamically import from project root (process.cwd())
    const projectRoot = process.cwd();
    const registryPath = path.join(projectRoot, 'src', 'seeders', 'registry.ts');
    const runnerPath = path.join(projectRoot, 'src', 'seeders', 'runner.ts');

    const registryModule = await import(pathToFileURL(registryPath).href);
    const runnerModule = await import(pathToFileURL(runnerPath).href);

    const { seeders } = registryModule;
    const { runSeeders } = runnerModule;

    if (!seeders || !runSeeders) {
      throw new Error(
        'Could not find seeders registry or runner. Make sure src/seeders/registry.ts and src/seeders/runner.ts exist.',
      );
    }

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
