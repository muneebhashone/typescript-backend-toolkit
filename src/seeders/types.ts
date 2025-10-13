import type mongoose from 'mongoose';
import type config from '../config/env';
import logger from '../observability/logger';

export type SeederContext = {
  db: mongoose.Connection;
  config: typeof config;
  logger: typeof logger;
  refs: {
    set: (key: string, value: unknown) => void;
    get: <T = unknown>(key: string) => T;
    has: (key: string) => boolean;
    keys: () => string[];
  };
  env: {
    group: string;
    dryRun: boolean;
    seed: number;
    now: Date;
  };
};

export type Seeder = {
  name: string;
  run: (ctx: SeederContext) => Promise<void>;
  dependsOn?: string[];
  groups?: string[];
  transaction?: boolean; // default: true
  collections?: string[]; // for --fresh drop targeting
};
