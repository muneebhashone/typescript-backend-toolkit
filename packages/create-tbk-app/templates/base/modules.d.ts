import { Server } from 'socket.io';
import { JwtPayload } from '@/utils/jwt.utils';
import { Config } from '@/config/env';
import { SessionRecord } from '@/modules/auth/session/session.types';
import { SessionManager } from '@/modules/auth/session/session.manager';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
      io: Server;
      session?: SessionRecord;
    }

    export interface Locals {
      sessionManager?: SessionManager;
    }
  }

  namespace NodeJS {
    export interface ProcessEnv extends Config {}
  }
}
