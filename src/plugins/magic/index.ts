import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { convertDocumentationToYaml } from './swagger-doc-generator';
import { ServerObject } from 'openapi3-ts/oas30';

export interface OpenApiOptions {
  description: string;
  servers: ServerObject[];
  path: string;
}

export const magicRouterPlugin: PluginFactory<OpenApiOptions> = (
  options,
): ToolkitPlugin<OpenApiOptions> => {
  const { path, description, servers } = options as OpenApiOptions;

  return {
    name: 'magic-router',
    priority: 20,
    options,

    register({ app, port }) {
      const swaggerDocument = YAML.parse(
        convertDocumentationToYaml(description, servers),
      );
      app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

      return [`http://localhost:${port}${path}`];
    },
  };
};

export default magicRouterPlugin;
