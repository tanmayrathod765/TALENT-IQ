import { StreamVideoClient } from "@stream-io/video-react-sdk";

let videoClient = null;

export const initializeStreamClient = async (user, token) => {
  if (videoClient) return videoClient;

  const apiKey = import.meta.env.VITE_STREAM_API_KEY;

  videoClient = new StreamVideoClient({
    apiKey,
    user,
    token,
  });

  return videoClient;
};

export const disconnectStreamClient = async () => {
  try {
    if (videoClient) {
      await videoClient.disconnectUser();
      videoClient = null;
    }
  } catch (e) {
    console.error("Stream disconnect error", e);
  }
};
