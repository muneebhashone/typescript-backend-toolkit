import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { convertDocumentationToYaml } from './swagger-doc-generator';

export interface OpenApiOptions {
  path?: string;
  enabled?: boolean;
}

export const magicRouterPlugin: PluginFactory<OpenApiOptions> = (
  options = {},
): ToolkitPlugin<OpenApiOptions> => {
  const { path = '/docs', enabled = true } = options;

  return {
    name: 'magicRouter',
    priority: 10,
    options,

    register({ app }) {
      if (!enabled) {
        return;
      }

      const swaggerDocument = YAML.parse(convertDocumentationToYaml());
      app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    },
  };
};

export default magicRouterPlugin;
