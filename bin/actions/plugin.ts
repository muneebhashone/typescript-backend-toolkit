import path from 'path';
import fs from 'fs/promises';

export const createPluginAction = async (name: string) => {
  const pluginName = name.toLowerCase();
  const className = name.charAt(0).toUpperCase() + name.slice(1);

  const pluginContent = `import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';

export interface ${className}Options {
  enabled?: boolean;
}

export const ${pluginName}Plugin: PluginFactory<${className}Options> = (
  options = {},
): ToolkitPlugin<${className}Options> => {
  const { enabled = true } = options;

  return {
    name: '${pluginName}',
    priority: 50,
    options,
    
    register({ app }) {
      if (!enabled) {
        return;
      }

      // Plugin implementation here
      console.log('${className} plugin registered');
    },

    onShutdown: async () => {
      // Cleanup logic here
      console.log('${className} plugin shutdown');
    },
  };
};

export default ${pluginName}Plugin;
`;

  await fs.mkdir(path.join(process.cwd(), 'src', 'plugins', pluginName), {
    recursive: true,
  });

  const outputPath = path.join(
    process.cwd(),
    'src',
    'plugins',
    pluginName,
    'index.ts',
  );

  try {
    await fs.writeFile(outputPath, pluginContent, 'utf-8');
    console.log(`✓ Plugin created: ${outputPath}`);
  } catch (error) {
    console.error('Failed to create plugin:', error);
    process.exit(1);
  }
};
