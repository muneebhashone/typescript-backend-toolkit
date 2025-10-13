import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../lib/database';
import config from '../config/env';
import logger from '../observability/logger';
import type { Seeder, SeederContext } from './types';

type RunOptions = {
  group?: string;
  only?: string[];
  modules?: string[]; // reserved for future module filtering
  fresh?: boolean;
  force?: boolean;
  dryRun?: boolean;
  seed?: number;
  transaction?: boolean; // global override
};

export const runSeeders = async (
  seeders: Seeder[],
  options: RunOptions = {},
): Promise<void> => {
  const group = options.group ?? process.env.SEED_DEFAULT_GROUP ?? 'dev';
  const seed = options.seed ?? (Number(process.env.SEED_SEED) || 1);
  const dryRun = Boolean(options.dryRun ?? false);
  const useTransactions = options.transaction ?? true;
  const fresh = Boolean(options.fresh ?? false);
  const force = Boolean(options.force ?? false);

  if (process.env.NODE_ENV === 'production' && !force) {
    throw new Error(
      'Seeding in production is blocked. Use --force or set ALLOW_SEED_IN_PROD=true.',
    );
  }

  // Filter by group and explicit selection
  let list = seeders.filter((s) => !s.groups || s.groups.includes(group));
  if (options.only && options.only.length) {
    const onlySet = new Set(options.only.map((n) => n.toLowerCase()));
    list = list.filter((s) => onlySet.has(s.name.toLowerCase()));
  }

  // Topological sort according to dependsOn
  const byName = new Map(list.map((s) => [s.name, s] as const));
  const inDegree = new Map<string, number>();
  const edges = new Map<string, string[]>();
  for (const s of list) {
    inDegree.set(s.name, 0);
    edges.set(s.name, []);
  }
  for (const s of list) {
    for (const dep of s.dependsOn ?? []) {
      if (!byName.has(dep)) {
        throw new Error(
          `Seeder ${s.name} depends on missing seeder ${dep} in group ${group}`,
        );
      }
      edges.get(dep)!.push(s.name);
      inDegree.set(s.name, (inDegree.get(s.name) ?? 0) + 1);
    }
  }
  const queue: string[] = [];
  for (const [name, deg] of inDegree) if (deg === 0) queue.push(name);
  const ordered: Seeder[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    ordered.push(byName.get(n)!);
    for (const m of edges.get(n) ?? []) {
      const d = (inDegree.get(m) ?? 0) - 1;
      inDegree.set(m, d);
      if (d === 0) queue.push(m);
    }
  }
  if (ordered.length !== list.length) {
    throw new Error('Circular dependency detected among seeders');
  }

  // Connect DB
  await connectDatabase();

  try {
    const db = mongoose.connection;

    const refs = new Map<string, unknown>();
    const ctx: SeederContext = {
      db,
      config,
      logger,
      refs: {
        set: (k, v) => refs.set(k, v),
        get: <T = unknown>(k: string) => refs.get(k) as T,
        has: (k) => refs.has(k),
        keys: () => Array.from(refs.keys()),
      },
      env: { group, dryRun, seed, now: new Date() },
    };

    // Fresh: drop involved collections
    if (fresh) {
      const toDrop = new Set<string>();
      for (const s of ordered)
        for (const c of s.collections ?? []) toDrop.add(c);
      if (toDrop.size) {
        logger.warn(
          `Fresh mode: dropping collections: ${Array.from(toDrop).join(', ')}`,
        );
        for (const coll of toDrop) {
          try {
            const exists =
              (await db.db!.listCollections({ name: coll }).toArray()).length >
              0;
            if (exists && !dryRun) await db.dropCollection(coll);
          } catch (e) {
            logger.warn(
              `Failed to drop collection ${coll}: ${(e as Error).message}`,
            );
          }
        }
      }
    }

    // Execute seeders
    for (const seeder of ordered) {
      const shouldTx = seeder.transaction ?? true;
      logger.info(`→ Running ${seeder.name} (group=${group})`);

      if (dryRun) {
        logger.info(`[dry-run] Skipping execution of ${seeder.name}`);
        continue;
      }

      if (useTransactions && shouldTx) {
        const session = await db.startSession();
        try {
          await session.withTransaction(async () => {
            await seeder.run(ctx);
          });
        } finally {
          await session.endSession();
        }
      } else {
        await seeder.run(ctx);
      }
      logger.info(`✓ Completed ${seeder.name}`);
    }
  } finally {
    await disconnectDatabase();
  }
};
