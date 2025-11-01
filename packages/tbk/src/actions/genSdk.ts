import { execa } from 'execa';
import path from 'path';

export const createGenSdkAction = async () => {
  try {
    console.log('Generating TypeScript SDK from OpenAPI spec...');

    const projectRoot = process.cwd();
    const openapiPath = path.join(projectRoot, 'public', 'openapi.yml');
    const outputPath = path.join(projectRoot, 'src', 'generated');

    // Run swagger-typescript-api generate
    await execa(
      'npx',
      [
        'swagger-typescript-api',
        'generate',
        '--path',
        openapiPath,
        '--output',
        outputPath,
      ],
      {
        stdio: 'inherit',
      },
    );

    console.log('✓ TypeScript SDK generated successfully at:', outputPath);

    process.exit(0);
  } catch (error) {
    console.error('Failed to generate SDK:', error);
    process.exit(1);
  }
};
