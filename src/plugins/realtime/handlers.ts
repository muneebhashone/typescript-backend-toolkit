import type { Server } from 'socket.io';
import logger from '@/plugins/logger';

export function registerRealtimeHandlers(io: Server) {
  io.on('connection', (socket) => {
    logger.info({ id: socket.id }, 'socket connected');

    socket.on('ping', (data) => {
      socket.emit('pong', data ?? 'pong');
    });

    // Rooms: join a room
    socket.on('room:join', (payload) => {
      const room = typeof payload === 'string' ? payload : payload?.room;
      if (!room || typeof room !== 'string') return;
      const trimmed = room.trim();
      if (!trimmed) return;
      socket.join(trimmed);
      socket.emit('room:joined', { room: trimmed });
    });

    // Rooms: leave a room
    socket.on('room:leave', (payload) => {
      const room = typeof payload === 'string' ? payload : payload?.room;
      if (!room || typeof room !== 'string') return;
      const trimmed = room.trim();
      if (!trimmed) return;
      socket.leave(trimmed);
      socket.emit('room:left', { room: trimmed });
    });

    // Rooms: broadcast to a room (from client via server)
    socket.on('room:broadcast', (payload) => {
      const room = payload?.room;
      const event = payload?.event;
      if (!room || typeof room !== 'string') return;
      if (!event || typeof event !== 'string') return;
      const trimmed = room.trim();
      if (!trimmed) return;
      io.to(trimmed).emit(event, payload?.payload);
    });

    socket.on('disconnect', (reason) => {
      logger.info({ id: socket.id, reason }, 'socket disconnected');
    });
  });
}

export default registerRealtimeHandlers;
