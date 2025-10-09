import pino from 'pino';
import pinoHttp from 'pino-http';
import type { RequestExtended } from '../types';
import { ServerResponse as ResponseHTTP } from 'node:http';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  serializers: {
    req: (req) => {
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
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      };
    },
    res: (res: unknown) => ({
      statusCode:
        res instanceof Response
          ? res.statusText
          : res instanceof ResponseHTTP
            ? 200
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

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export default logger;
