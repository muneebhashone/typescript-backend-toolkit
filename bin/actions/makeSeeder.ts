export const createMakeSeederAction = async (fullName: string) => {
  const [module, rawName] = String(fullName).split('/');
  const seederName = rawName.endsWith('Seeder') ? rawName : `${rawName}Seeder`;
  const className = seederName;
  const fs = await import('fs/promises');
  const path = await import('path');

  const content = `import type { Seeder } from '@/seeders/types';

export const ${className}: Seeder = {
  name: '${className}',
  groups: ['dev'],
  dependsOn: [],
  collections: [],
  async run(ctx) {
    // TODO: implement seeding logic
    ctx.logger.info('Running ${className}');
  },
};
`;

  const outputPath = path.join(
    process.cwd(),
    'src',
    'modules',
    module,
    'seeders',
  );
  const filePath = path.join(outputPath, `${className}.ts`);
  try {
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Seeder created: ${filePath}`);
  } catch (error) {
    console.error('Failed to create seeder:', error);
    process.exit(1);
  }
};
