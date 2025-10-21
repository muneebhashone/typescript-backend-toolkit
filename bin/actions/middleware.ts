import path from 'path';
import fs from 'fs/promises';

const toKebabCase = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const toCamelCase = (s: string) =>
  toKebabCase(s)
    .split('-')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');

const toPascalCase = (s: string) => {
  const c = toCamelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
};

export const createMiddlewareAction = async (rawName: string) => {
  const base = rawName.replace(/-?middleware$/i, '');

  const fileBase = toKebabCase(base);
  const exportBase = toCamelCase(base);
  const optionsType = `${toPascalCase(base)}Options`;

  const dir = path.join(process.cwd(), 'src', 'middlewares');
  const outputPath = path.join(dir, `${fileBase}.ts`);

  const middlewareContent = `import type { NextFunction } from 'express';
import { StatusCodes } from '@/plugins/magic/status-codes';
import { errorResponse } from '@/utils/response.utils';
import type { RequestAny, ResponseAny } from '@/plugins/magic/router';

export type ${optionsType} = Record<string, never>;

export const ${exportBase} = (options?: ${optionsType}) =>
  async (req: RequestAny, res: ResponseAny, next: NextFunction) => {
    try {
      // TODO: implement ${fileBase} middleware logic
    } catch (err) {
      return errorResponse(
        res,
        (err as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    return next();
  };

export default ${exportBase};
`;

  try {
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(outputPath);
      console.error(`✗ Middleware already exists: ${outputPath}`);
      process.exit(1);
    } catch {
      // file does not exist, continue
    }

    await fs.writeFile(outputPath, middlewareContent, 'utf-8');
    console.log(`✓ Middleware created: ${outputPath}`);
  } catch (error) {
    console.error('Failed to create middleware:', error);
    process.exit(1);
  }
};
