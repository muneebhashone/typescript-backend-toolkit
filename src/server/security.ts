import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Application } from 'express';

export interface SecurityOptions {
  corsEnabled?: boolean;
  corsOrigins?: string | string[];
  corsCredentials?: boolean;
  
  helmetEnabled?: boolean;
  helmetOptions?: Parameters<typeof helmet>[0];
  
  rateLimitEnabled?: boolean;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  rateLimitMessage?: string;
  
  trustProxy?: boolean;
}

export function applySecurity(app: Application, options: SecurityOptions = {}): void {
  const {
    corsEnabled = true,
    corsOrigins = '*',
    corsCredentials = false,
    
    helmetEnabled = true,
    helmetOptions = {},
    
    rateLimitEnabled = true,
    rateLimitWindowMs = 15 * 60 * 1000,
    rateLimitMax = 100,
    rateLimitMessage = 'Too many requests from this IP, please try again later.',
    
    trustProxy = false,
  } = options;

  if (trustProxy) {
    app.set('trust proxy', true);
  }

  if (helmetEnabled) {
    app.use(helmet(helmetOptions));
  }

  if (corsEnabled) {
    const corsOptions = {
      origin: corsOrigins,
      credentials: corsCredentials,
      optionsSuccessStatus: 200,
    };
    app.use(cors(corsOptions));
  }

  if (rateLimitEnabled) {
    const limiter = rateLimit({
      windowMs: rateLimitWindowMs,
      max: rateLimitMax,
      message: rateLimitMessage,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        const healthPaths = ['/health', '/readiness', '/metrics'];
        return healthPaths.some((path) => req.path.endsWith(path));
      },
    });
    app.use(limiter);
  }
}

export default applySecurity;
