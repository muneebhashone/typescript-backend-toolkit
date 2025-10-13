import type { Server } from 'socket.io';
import logger from '../observability/logger';

export function registerRealtimeHandlers(io: Server) {
  io.on('connection', (socket) => {
    logger.info({ id: socket.id }, 'socket connected');

    socket.on('ping', (data) => {
      socket.emit('pong', data ?? 'pong');
    });

    socket.on('disconnect', (reason) => {
      logger.info({ id: socket.id, reason }, 'socket disconnected');
    });
  });
}

export default registerRealtimeHandlers;
