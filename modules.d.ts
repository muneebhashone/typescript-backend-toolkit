import { Server } from 'socket.io';
import { JwtPayload } from '../utils/auth.utils';
import { Config } from './src/config/config.service';
import { SessionRecord } from './src/modules/auth/session/session.types';
import { SessionManager } from './src/modules/auth/session/session.manager';

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
