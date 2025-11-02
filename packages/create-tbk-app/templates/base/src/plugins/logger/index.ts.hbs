import pino from 'pino';
import pinoHttp from 'pino-http';
import type { Request } from 'express';
import type { RequestExtended } from '@/types';
import { ServerResponse as ResponseHTTP } from 'node:http';
import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';

// ============================================================================
// Types
// ============================================================================

export type PinoLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  /** Enable HTTP request logging middleware (default: true) */
  enabled?: boolean;
  /** Override LOG_LEVEL environment variable */
  level?: PinoLogLevel;
  /** Force pretty printing even in production (default: auto based on NODE_ENV) */
  pretty?: boolean;
  /** Paths to redact from logs (e.g., ['req.headers.authorization']) */
  redact?: string[];
}

export interface ChildLoggerContext extends Record<string, unknown> {
  context?: string;
}

// ============================================================================
// Logger Configuration
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const defaultLogLevel: PinoLogLevel = (process.env.LOG_LEVEL as PinoLogLevel) ||
  (isDevelopment ? 'debug' : 'info');

/**
 * Create a configured pino logger instance
 */
function createLogger(options: LoggerOptions = {}) {
  const usePretty = options.pretty !== undefined
    ? options.pretty
    : isDevelopment;

  const level = options.level || defaultLogLevel;

  return pino({
    level,
    redact: options.redact || [],
    transport: usePretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
            customColors: 'info:blue,warn:yellow,error:red,debug:gray',
            levelFirst: false,
            singleLine: false,
          },
        }
      : undefined,
    formatters: {
      level: (label: string) => {
        return { level: label.toUpperCase() };
      },
    },
  });
}

/**
 * Main logger instance - exported for direct use throughout the application
 */
export const logger = createLogger();

// ============================================================================
// HTTP Logger Configuration
// ============================================================================

/**
 * HTTP request logging middleware using pino-http
 * Automatically logs all HTTP requests with appropriate log levels based on status codes
 */
export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req: Request, res: ResponseHTTP, err?: Error) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (req: Request, res: ResponseHTTP) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: ResponseHTTP, err: Error) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  serializers: {
    req: (req: Request) => {
      const extended = req as RequestExtended;
      return {
        id: extended.id,
        method: req.method,
        url: req.url,
        path: req.path,
        headers: {
          host: req.headers.host,
          'user-agent': req.headers['user-agent'],
          'x-request-id': req.headers['x-request-id'],
        },
        remoteAddress: req.socket?.remoteAddress,
        remotePort: req.socket?.remotePort,
      };
    },
    res: (res: unknown) => ({
      statusCode:
        res instanceof Response
          ? res.status
          : res instanceof ResponseHTTP
            ? res.statusCode
            : 200,
      headers: {
        'content-type':
          res instanceof Response
            ? res.headers.get('content-type')
            : res instanceof ResponseHTTP
              ? res.getHeader('content-type')
              : 'application/json',
        'content-length':
          res instanceof Response
            ? res.headers.get('content-length')
            : res instanceof ResponseHTTP
              ? res.getHeader('content-length')
              : '100',
      },
    }),
  },
});

// ============================================================================
// Child Logger Factory
// ============================================================================

/**
 * Create a child logger with contextual information
 *
 * @example
 * ```typescript
 * const logger = createChildLogger({ context: 'AuthService', userId: '123' });
 * logger.info('User logged in');
 * // Output: [AuthService] User logged in { userId: '123' }
 * ```
 *
 * @param context - Context object to attach to all log messages
 * @returns A child logger instance with the provided context
 */
export function createChildLogger<T extends ChildLoggerContext>(context: T) {
  const msgPrefix = context.context ? `[${context.context}] ` : '';
  return logger.child(context, { msgPrefix });
}

// ============================================================================
// Plugin Factory
// ============================================================================

/**
 * Logger plugin for TypeScript Backend Toolkit
 *
 * Provides structured logging capabilities with:
 * - Pino logger with pretty printing in development
 * - HTTP request logging middleware
 * - Child logger factory for contextual logging
 * - Type-safe configuration options
 *
 * @example
 * ```typescript
 * import loggerPlugin from '@/plugins/logger';
 *
 * const plugins = [
 *   loggerPlugin({
 *     enabled: true,
 *     level: 'debug',
 *     redact: ['req.headers.authorization'],
 *   }),
 * ];
 * ```
 */
export const loggerPlugin: PluginFactory<LoggerOptions> = (
  options = {},
): ToolkitPlugin<LoggerOptions> => {
  const { enabled = true } = options;

  return {
    name: 'logger',
    priority: 100, // High priority - many plugins depend on logger
    options,

    register({ app }) {
      if (!enabled) {
        return [];
      }

      // Register HTTP logging middleware
      app.use(httpLogger);

      logger.debug('Logger plugin registered');

      return [];
    },

    onShutdown: async () => {
      logger.info('Logger plugin shutting down');
      // Pino handles its own cleanup
    },
  };
};

export default logger;
