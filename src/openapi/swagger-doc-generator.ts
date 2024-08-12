import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import fs from 'node:fs/promises';
import * as yaml from 'yaml';

import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { registry } from './swagger-instance';

export const getOpenApiDocumentation = (): OpenAPIObject => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'My API',
      description: 'This is the API',
    },
    servers: [{ url: 'v1' }],
  });
};

export const convertDocumentationToYaml = (): string => {
  const docs = getOpenApiDocumentation();

  const fileContent = yaml.stringify(docs);

  return fileContent;
};

export const writeDocumentationToDisk = async (): Promise<void> => {
  const fileContent = convertDocumentationToYaml();

  await fs.writeFile(`${__dirname}/openapi-docs.yml`, fileContent, {
    encoding: 'utf-8',
  });
};
