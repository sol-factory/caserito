import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  const server = process.env.NEXT_PUBLIC_IO_SERVER;

  if (!socket) {
    socket = io(server, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("Conectado al servidor de WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor de WebSocket");
    });
  }
  return socket;
};
