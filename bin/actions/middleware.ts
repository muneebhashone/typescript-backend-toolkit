import path from 'path';
import fs from 'fs/promises';

export const createMiddlewareAction = async (name: string) => {
  const middlewareName = name.toLowerCase();

  const middlewareContent = `import type { Request, Response, NextFunction } from 'express';

export function ${middlewareName}Middleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Middleware implementation here
  next();
}

export default ${middlewareName}Middleware;
`;

  const outputPath = path.join(
    process.cwd(),
    'src',
    'middlewares',
    `${middlewareName}.ts`,
  );

  try {
    await fs.writeFile(outputPath, middlewareContent, 'utf-8');
    console.log(`✓ Middleware created: ${outputPath}`);
  } catch (error) {
    console.error('Failed to create middleware:', error);
    process.exit(1);
  }
};
