import net from 'net';
import readline from 'readline/promises';
import logger from '../observability/logger';

/**
 * Check if a port is available on the given host
 */
export async function isPortFree(
  port: number,
  host: string = '0.0.0.0',
): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, host);
  });
}

/**
 * Find the next available port starting from a given port
 */
export async function findNextFreePort(
  startPort: number,
  maxAttempts: number = 50,
  host: string = '0.0.0.0',
): Promise<number | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (port > 65535) break;

    const isFree = await isPortFree(port, host);
    if (isFree) {
      return port;
    }
  }
  return null;
}

/**
 * Interactive prompt to resolve port conflicts
 */
async function promptForPort(
  busyPort: number,
  suggestedPort: number,
): Promise<number | null> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log(
      `\n⚠️  Port ${busyPort} is already in use.\n`,
    );

    const answer = await rl.question(
      `Would you like to use port ${suggestedPort} instead? [Y/n] or enter a custom port (q to quit): `,
    );

    const trimmed = answer.trim().toLowerCase();

    // Quit
    if (trimmed === 'q' || trimmed === 'quit') {
      console.log('❌ Server startup cancelled by user.');
      return null;
    }

    // Accept suggestion (empty, 'y', 'yes')
    if (trimmed === '' || trimmed === 'y' || trimmed === 'yes') {
      return suggestedPort;
    }

    // Reject suggestion ('n', 'no')
    if (trimmed === 'n' || trimmed === 'no') {
      const customAnswer = await rl.question('Enter a custom port number: ');
      const customPort = parseInt(customAnswer.trim(), 10);

      if (isNaN(customPort) || customPort < 1 || customPort > 65535) {
        console.log('❌ Invalid port number. Must be between 1 and 65535.');
        return null;
      }

      return customPort;
    }

    // Direct numeric input
    const directPort = parseInt(trimmed, 10);
    if (!isNaN(directPort)) {
      if (directPort < 1 || directPort > 65535) {
        console.log('❌ Invalid port number. Must be between 1 and 65535.');
        return null;
      }
      return directPort;
    }

    console.log('❌ Invalid input. Please try again.');
    return null;
  } finally {
    rl.close();
  }
}

export interface ResolvePortOptions {
  desiredPort: number;
  host?: string;
  interactive?: boolean;
  maxAttempts?: number;
}

/**
 * Resolve an available port, prompting the user if the desired port is busy
 * Returns the selected port or throws if resolution fails
 */
export async function resolvePort(
  options: ResolvePortOptions,
): Promise<number> {
  const {
    desiredPort,
    host = '0.0.0.0',
    interactive = process.stdout.isTTY && !process.env.CI,
    maxAttempts = 50,
  } = options;

  // Check if desired port is available
  const isDesiredPortFree = await isPortFree(desiredPort, host);

  if (isDesiredPortFree) {
    return desiredPort;
  }

  logger.warn(
    { port: desiredPort },
    `Port ${desiredPort} is not available`,
  );

  // Non-interactive mode: auto-find next port
  if (!interactive) {
    logger.info('Running in non-interactive mode, finding next available port...');
    const nextPort = await findNextFreePort(desiredPort + 1, maxAttempts, host);

    if (nextPort === null) {
      throw new Error(
        `Could not find an available port after checking ${maxAttempts} ports starting from ${desiredPort}`,
      );
    }

    logger.info({ port: nextPort }, `Using port ${nextPort} instead`);
    return nextPort;
  }

  // Interactive mode: prompt user
  let selectedPort: number | null = null;

  while (selectedPort === null) {
    const suggestedPort = await findNextFreePort(
      desiredPort + 1,
      maxAttempts,
      host,
    );

    if (suggestedPort === null) {
      throw new Error(
        `Could not find an available port after checking ${maxAttempts} ports starting from ${desiredPort}`,
      );
    }

    const userChoice = await promptForPort(desiredPort, suggestedPort);

    if (userChoice === null) {
      throw new Error('Port resolution cancelled by user');
    }

    // Validate the user's choice
    const isChoiceFree = await isPortFree(userChoice, host);

    if (isChoiceFree) {
      selectedPort = userChoice;
      console.log(`✅ Using port ${selectedPort}\n`);
    } else {
      console.log(
        `❌ Port ${userChoice} is also in use. Let's try again.\n`,
      );
      // Loop will continue with a new suggestion
    }
  }

  return selectedPort;
}
