// server/utils/socket.js
import { Server } from 'socket.io';
let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: { origin: '*' },
  });

  ioInstance.on('connection', (socket) => {
    // Clients MUST send 'user' object immediately to join room
    socket.on('register', ({ userId, role }) => {
      if (userId && role) socket.join(`${role}:${userId}`);
    });
    socket.on('disconnect', () => { /* Clean up if needed */ });
  });
}

export function getIoInstance() {
  return ioInstance;
}
