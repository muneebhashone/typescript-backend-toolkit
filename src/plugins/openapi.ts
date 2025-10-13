import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import type { ToolkitPlugin, PluginFactory } from './types';
import { convertDocumentationToYaml } from '../openapi/swagger-doc-generator';

export interface OpenApiOptions {
  path?: string;
  enabled?: boolean;
}

export const openApiPlugin: PluginFactory<OpenApiOptions> = (
  options = {},
): ToolkitPlugin<OpenApiOptions> => {
  const { path = '/docs', enabled = true } = options;

  return {
    name: 'openapi',
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

export default openApiPlugin;
