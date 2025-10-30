import type { PresetConfig } from '../types/config.types.js';

export const PRESETS: Record<string, PresetConfig> = {
  minimal: {
    name: 'Minimal',
    description: 'Bare-bones API with core features only (Express, MongoDB, MagicRouter)',
    config: {
      auth: 'none',
      googleOAuth: false,
      cache: 'none',
      queues: false,
      storage: 'none',
      email: 'none',
      realtime: false,
      admin: false,
      queueDashboard: false,
      observability: 'basic',
    },
  },
  standard: {
    name: 'Standard',
    description: 'Production-ready REST API with auth, security, and full observability',
    config: {
      auth: 'jwt',
      googleOAuth: false,
      cache: 'memory',
      queues: false,
      storage: 'none',
      email: 'none',
      realtime: false,
      admin: false,
      queueDashboard: false,
      observability: 'full',
    },
  },
  full: {
    name: 'Full-Featured',
    description: 'Complete backend with all features (auth, cache, queues, storage, email, realtime, admin)',
    config: {
      auth: 'jwt-sessions',
      sessionDriver: 'redis',
      googleOAuth: false,
      cache: 'redis',
      queues: true,
      storage: 's3',
      email: 'resend',
      realtime: true,
      admin: true,
      queueDashboard: true,
      observability: 'full',
    },
  },
};

export function getPresetChoices() {
  return [
    ...Object.entries(PRESETS).map(([key, preset]) => ({
      name: `${preset.name} - ${preset.description}`,
      value: key,
    })),
    {
      name: 'Custom - Choose your own features',
      value: 'custom',
    },
  ];
}
