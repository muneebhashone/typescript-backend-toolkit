import { Server as IServer } from 'http';
import { Server as RealtimeServer } from 'socket.io';

let io: RealtimeServer | null = null;

export const useSocketIo = (server?: IServer): RealtimeServer => {
  if (io instanceof RealtimeServer) {
    return io;
  } else if (!server) {
    throw new Error('Server instanse is required');
  }

  io = new RealtimeServer(server, {
    transports: ['websocket'],
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      //   credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit(
      'connected',
      `User is connected with SocketID: ${
        socket.id
      }, Date: ${new Date().toISOString()}`,
    );
  });

  return io;
};
