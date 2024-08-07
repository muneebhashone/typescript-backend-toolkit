// import { useSocketIo } from '../lib/realtime.server';

// const io = useSocketIo();
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.emit('chat message', 'Welcome');

//   socket.on('chat message', async (msg, clientOffset, callback) => {
//     let result;
//     try {
//       result = 10;
//     } catch (e) {
//       console.error('Error processing message:', e);
//       return;
//     }
//     io.emit('chat message', 'Server', result);
//     callback();
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });
