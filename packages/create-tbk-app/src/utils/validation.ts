import validate from 'validate-npm-package-name';
import fs from 'fs-extra';
import path from 'path';

export function validateProjectName(name: string): { valid: boolean; error?: string } {
  const result = validate(name);

  if (!result.validForNewPackages) {
    const errors = [...(result.errors || []), ...(result.warnings || [])];
    return {
      valid: false,
      error: errors.join(', '),
    };
  }

  return { valid: true };
}

export async function checkDirectoryExists(targetDir: string): Promise<boolean> {
  try {
    const exists = await fs.pathExists(targetDir);
    if (exists) {
      const files = await fs.readdir(targetDir);
      return files.length > 0;
    }
    return false;
  } catch {
    return false;
  }
}

export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
