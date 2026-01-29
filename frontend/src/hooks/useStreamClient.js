import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const init = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        // ✅ get stream token from backend
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        // ✅ init video client
        const client = await initializeStreamClient(
          { id: userId, name: userName, image: userImage },
          token
        );

        setStreamClient(client);

        videoCall = client.call("default", session.callId);

        // ✅ JOIN CALL FIRST (no device yet)
        await videoCall.join({ create: true });

        // ✅ SAFE MIC SETUP (won’t crash)
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const mic = devices.find((d) => d.kind === "audioinput");

          if (mic) {
            await videoCall.microphone.select(mic.deviceId);
            await videoCall.microphone.enable();
          } else {
            console.warn("No microphone device — continuing muted");
          }
        } catch (e) {
          console.warn("Mic setup failed — continuing muted");
        }

        setCall(videoCall);

        // ✅ CHAT CLIENT
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          { id: userId, name: userName, image: userImage },
          token
        );

        setChatClient(chatClientInstance);

        const ch = chatClientInstance.channel("messaging", session.callId);
        await ch.watch();
        setChannel(ch);

      } catch (err) {
        console.error("Init call error:", err);
        toast.error("Video call connection failed");
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) init();

    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (e) {
          console.error("cleanup error", e);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
