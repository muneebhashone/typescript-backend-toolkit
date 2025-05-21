import type { Server as IServer } from "node:http";
import { Server as RealtimeServer } from "socket.io";

export const useSocketIo = (server: IServer): RealtimeServer => {
	// TODO: Functional implementation of socket.io event emitting and handling is pending (see project roadmap).
	const io = new RealtimeServer(server, {
		transports: ["polling", "websocket"],
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	return io;
};
