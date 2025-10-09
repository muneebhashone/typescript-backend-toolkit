import type { Application } from 'express';
import type { Server } from 'http';

export interface AppContext {
  app: Application;
  server?: Server;
  config?: Record<string, unknown>;
}

export interface ToolkitPlugin<TOptions = unknown> {
  name: string;
  priority?: number;
  options?: TOptions;
  
  register(context: AppContext): Promise<void> | void;
  
  onShutdown?: () => Promise<void> | void;
}

export type PluginFactory<TOptions = unknown> = (
  options?: TOptions,
) => ToolkitPlugin<TOptions>;

export interface PluginRegistration {
  plugin: ToolkitPlugin;
  enabled: boolean;
}
