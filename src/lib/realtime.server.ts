import { Server as IServer } from 'http';
import { Server as RealtimeServer } from 'socket.io';

declare global {
  var io: RealtimeServer;
}

let io: RealtimeServer | null = globalThis.io;

export const useSocketIo = (server?: IServer): RealtimeServer => {
  if (io) {
    return io;
  } else if (!server) {
    throw new Error('Server instanse is required');
  }

  globalThis.io = new RealtimeServer(server, {
    transports: ['polling', 'websocket'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  return globalThis.io;
};
