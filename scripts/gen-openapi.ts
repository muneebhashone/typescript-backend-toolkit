#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import 'src/openapi/zod-extend';
import 'src/routes/routes';
import { convertDocumentationToYaml } from '@/plugins/magic/swagger-doc-generator';

async function generateOpenApiSpec() {
  try {
    console.log('Generating OpenAPI specification...');

    const yamlContent = convertDocumentationToYaml(
      "Robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project",
      [{ url: '/api' }],
    );

    const outputPath = path.join(process.cwd(), 'public', 'openapi.yml');
    await fs.writeFile(outputPath, yamlContent, 'utf-8');

    console.log(`✓ OpenAPI spec generated successfully at: ${outputPath}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error);
    process.exit(1);
  }
}

generateOpenApiSpec();
