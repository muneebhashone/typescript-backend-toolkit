#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { convertDocumentationToYaml } from '../src/openapi/swagger-doc-generator';

async function generateOpenApiSpec() {
  try {
    console.log('Generating OpenAPI specification...');
    
    const yamlContent = convertDocumentationToYaml();
    
    const outputPath = path.join(process.cwd(), 'openapi.yml');
    await fs.writeFile(outputPath, yamlContent, 'utf-8');
    
    console.log(`✓ OpenAPI spec generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error);
    process.exit(1);
  }
}

generateOpenApiSpec();
