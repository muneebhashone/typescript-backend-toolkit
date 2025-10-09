import type { ToolkitPlugin, PluginFactory } from './types';

export interface UploadsOptions {
  enabled?: boolean;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  destination?: string;
}

export const uploadsPlugin: PluginFactory<UploadsOptions> = (
  options = {},
): ToolkitPlugin<UploadsOptions> => {
  const {
    enabled = true,
    maxFileSize = 10 * 1024 * 1024,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'],
    destination = './uploads',
  } = options;

  return {
    name: 'uploads',
    priority: 40,
    options,
    
    register({ app }) {
      if (!enabled) {
        return;
      }

      app.set('uploads:maxFileSize', maxFileSize);
      app.set('uploads:allowedMimeTypes', allowedMimeTypes);
      app.set('uploads:destination', destination);
    },
  };
};

export default uploadsPlugin;
