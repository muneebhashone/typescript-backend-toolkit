import type { Application } from 'express';
import type { Server } from 'http';

export interface AppContext {
  app: Application;
  server: Server;
  config: Record<string, unknown>;
  port: number;
}

export interface ToolkitPlugin<TOptions = unknown> {
  name: string;
  priority?: number;
  options?: TOptions;

  register(context: AppContext): Promise<void | string[]> | void | string[];

  onShutdown?: () => Promise<void | string[]> | void | string[];
}

export type PluginFactory<TOptions = unknown> = (
  options?: TOptions,
) => ToolkitPlugin<TOptions>;

export interface PluginRegistration {
  plugin: ToolkitPlugin;
  enabled: boolean;
}
