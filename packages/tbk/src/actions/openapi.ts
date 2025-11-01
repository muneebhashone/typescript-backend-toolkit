import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

export const createOpenApiAction = async (opts: { env?: string }) => {
  try {
    // Load environment file if specified
    const envFile = opts.env || '.env.development';
    const envPath = path.join(process.cwd(), envFile);

    try {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.warn(`⚠ Could not load ${envFile}, continuing without it...`);
      } else {
        console.log(`✓ Loaded environment from ${envFile}`);
      }
    } catch (error) {
      console.warn(`⚠ Could not load ${envFile}, continuing without it...`);
    }

    console.log('Generating OpenAPI specification...');

    const projectRoot = process.cwd();

    // Import zod-extend to register OpenAPI extensions
    const zodExtendPath = path.join(
      projectRoot,
      'src',
      'plugins',
      'magic',
      'zod-extend.ts',
    );
    await import(pathToFileURL(zodExtendPath).href);

    // Import routes to register all endpoints
    const routesPath = path.join(projectRoot, 'src', 'routes', 'routes.ts');
    await import(pathToFileURL(routesPath).href);

    // Import swagger doc generator
    const swaggerGenPath = path.join(
      projectRoot,
      'src',
      'plugins',
      'magic',
      'swagger-doc-generator.ts',
    );
    const swaggerModule = await import(pathToFileURL(swaggerGenPath).href);

    const { convertDocumentationToYaml } = swaggerModule;

    if (!convertDocumentationToYaml) {
      throw new Error(
        'Could not find convertDocumentationToYaml. Make sure src/plugins/magic/swagger-doc-generator.ts exists.',
      );
    }

    const yamlContent = convertDocumentationToYaml(
      "Robust backend boilerplate designed for scalability, flexibility, and ease of development. It's packed with modern technologies and best practices to kickstart your next backend project",
      [{ url: '/api' }],
    );

    const outputPath = path.join(projectRoot, 'public', 'openapi.yml');
    await fs.writeFile(outputPath, yamlContent, 'utf-8');

    console.log(`✓ OpenAPI spec generated successfully at: ${outputPath}`);

    process.exit(0);
  } catch (error) {
    console.error('Failed to generate OpenAPI spec:', error);
    process.exit(1);
  }
};

