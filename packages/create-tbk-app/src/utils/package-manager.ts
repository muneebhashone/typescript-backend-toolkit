import { spawn } from 'child_process';
import type { PackageManager } from '../types/config.types.js';

export async function installDependencies(
  targetDir: string,
  packageManager: PackageManager,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = packageManager;
    const args = ['install'];

    const child = spawn(command, args, {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${packageManager} install failed with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export async function initGitRepository(targetDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['init'], {
      cwd: targetDir,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`git init failed with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export async function createInitialCommit(targetDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const commands = [
      ['add', '.'],
      ['commit', '-m', 'Initial commit from create-tbk-app'],
    ];

    const runCommand = (index: number) => {
      if (index >= commands.length) {
        resolve();
        return;
      }

      const child = spawn('git', commands[index], {
        cwd: targetDir,
        stdio: 'inherit',
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`git ${commands[index][0]} failed with code ${code}`));
        } else {
          runCommand(index + 1);
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    };

    runCommand(0);
  });
}
