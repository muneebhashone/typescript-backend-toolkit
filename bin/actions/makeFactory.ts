export const createMakeFactoryAction = async (fullName: string) => {
  const [module, rawName] = String(fullName).split('/');
  const baseName = rawName.replace(/\.factory$/i, '');
  const factoryVar = `${baseName.charAt(0).toLowerCase()}${baseName.slice(1)}Factory`;
  const fs = await import('fs/promises');
  const path = await import('path');

  const content = `// Example factory template. Adjust DTO and service imports.
export const ${factoryVar} = {
  build(i = 1, overrides: Record<string, unknown> = {}) {
    return { name: '${baseName} ' + i, ...overrides } as Record<string, unknown>;
  },
};
`;

  const outputPath = path.join(
    process.cwd(),
    'src',
    'modules',
    module,
    'factories',
  );
  const filePath = path.join(
    outputPath,
    `${baseName.toLowerCase()}.factory.ts`,
  );
  try {
    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Factory created: ${filePath}`);
  } catch (error) {
    console.error('Failed to create factory:', error);
    process.exit(1);
  }
};
