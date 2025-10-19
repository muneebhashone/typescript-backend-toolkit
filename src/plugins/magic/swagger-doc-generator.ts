import fs from 'node:fs/promises';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import * as yaml from 'yaml';

import type { OpenAPIObject, ServerObject } from 'openapi3-ts/oas30';
import config from '@/config/env';
import { registry } from './swagger-instance';
import path from 'node:path';

export const getOpenApiDocumentation = (
  description: string,
  servers: ServerObject[],
): OpenAPIObject => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    externalDocs: {
      url: '/openapi.yml',
      description: 'OpenAPI documentation for the API',
    },
    info: {
      version: config.APP_VERSION,
      title: config.APP_NAME,
      description: description,
    },
    servers: servers,
  });
};

export const convertDocumentationToYaml = (
  description: string,
  servers: ServerObject[],
): string => {
  const docs = getOpenApiDocumentation(description, servers);

  const fileContent = yaml.stringify(docs);

  return fileContent;
};

export const writeDocumentationToDisk = async (
  description: string,
  servers: ServerObject[],
): Promise<void> => {
  const fileContent = convertDocumentationToYaml(description, servers);

  await fs.writeFile(
    path.join(process.cwd(), 'public', 'openapi.yml'),
    fileContent,
    {
      encoding: 'utf-8',
    },
  );
};
