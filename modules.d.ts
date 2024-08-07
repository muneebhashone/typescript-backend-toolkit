import { Server } from 'socket.io';
import { JwtPayload } from '../utils/auth.utils';
import { Config } from './src/config/config.service';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
      io: Server;
    }
  }

  namespace NodeJS {
    export interface ProcessEnv extends Config {}
  }
}
