import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Helper to clean env vars from quotes
const cleanEnv = (val: string | undefined) => val?.replace(/['"]/g, "") || "";

// Pusher Server (for API routes)
export const pusherServer = new PusherServer({
  appId: cleanEnv(process.env.PUSHER_APP_ID),
  key: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_KEY),
  secret: cleanEnv(process.env.PUSHER_SECRET),
  cluster: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
  useTLS: true,
});

// Pusher Client (for client components)
export const getPusherClient = () => {
  return new PusherClient(cleanEnv(process.env.NEXT_PUBLIC_PUSHER_KEY), {
    cluster: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
  });
};
