import fs from 'fs-extra';
import path from 'path';

export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  exclude: string[] = [],
): Promise<void> {
  await fs.ensureDir(targetDir);

  const files = await fs.readdir(templateDir);

  for (const file of files) {
    if (exclude.includes(file)) {
      continue;
    }

    const templatePath = path.join(templateDir, file);
    const targetPath = path.join(targetDir, file);
    const stats = await fs.stat(templatePath);

    if (stats.isDirectory()) {
      await copyTemplate(templatePath, targetPath, exclude);
    } else {
      await fs.copy(templatePath, targetPath);
    }
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function copyFile(source: string, destination: string): Promise<void> {
  await fs.ensureDir(path.dirname(destination));
  await fs.copy(source, destination);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}
