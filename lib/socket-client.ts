// lib/socket-client.ts
// Socket.io Client Helper for Next.js API Routes

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// ✅ Get or create socket connection
export const getSocket = () => {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket.io connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.io disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
    });
  }

  return socket;
};

// ✅ Emit event to a specific room (from API routes)
export const emitToRoom = async (
  roomId: string,
  event: string,
  data: any,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const socket = getSocket();

    if (!socket.connected) {
      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Connection timeout")),
          5000,
        );
        socket.once("connect", () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });
    }

    // Emit to room via server
    socket.emit("broadcast-to-room", {
      roomId,
      event,
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("Socket.io emit error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ✅ Close socket connection
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
