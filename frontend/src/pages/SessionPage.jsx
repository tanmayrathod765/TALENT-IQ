import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const joinAttemptedRef = useRef(false);

  const { data: sessionData, isLoading: loadingSession } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;

  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participants?.clerkId === user?.id; // ✅ fixed

  const { call, channel, chatClient, isInitializingCall, streamClient } =
    useStreamClient(session, loadingSession, isHost, isParticipant);

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // ✅ SAFE AUTO JOIN (NO LOOP)
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    if (session.status !== "active") return;
    if (joinAttemptedRef.current) return;

    joinAttemptedRef.current = true;
    joinSessionMutation.mutate(id);

  }, [id, isHost, isParticipant, loadingSession, session?.status, user?.id]);

  // redirect when session ends
  useEffect(() => {
    if (!session || loadingSession) return;
    if (session.status === "completed") navigate("/dashboard");
  }, [session?.status, loadingSession]);

  // update starter code
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(problemData?.starterCode?.[newLang] || "");
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("End session?")) {
      endSessionMutation.mutate(id, {
        onSuccess: () => navigate("/dashboard"),
      });
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">

          {/* LEFT PANEL */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">

              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200 p-6">
                  <h1 className="text-3xl font-bold">
                    {session?.problem || "Loading..."}
                  </h1>

                  <div className="flex gap-3 mt-3">
                    <span className={`badge ${getDifficultyBadgeClass(session?.difficulty)}`}>
                      {session?.difficulty}
                    </span>

                    {isHost && session?.status === "active" && (
                      <button
                        onClick={handleEndSession}
                        className="btn btn-error btn-sm gap-2"
                      >
                        <LogOutIcon className="w-4 h-4" />
                        End Session
                      </button>
                    )}
                  </div>

                  {problemData && (
                    <div className="mt-6 space-y-4">
                      <p>{problemData.description.text}</p>
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">

                  <Panel defaultSize={70}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={setCode}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300" />

                  <Panel defaultSize={30}>
                    <OutputPanel output={output} />
                  </Panel>

                </PanelGroup>
              </Panel>

            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300" />

          {/* RIGHT PANEL — VIDEO */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4">

              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : !streamClient || !call ? (
                <div className="text-center">
                  <PhoneOffIcon className="w-12 h-12 text-error mx-auto" />
                  <p>Connection Failed</p>
                </div>
              ) : (
                <StreamVideo client={streamClient}>
                  <StreamCall call={call}>
                    <VideoCallUI chatClient={chatClient} channel={channel} />
                  </StreamCall>
                </StreamVideo>
              )}

            </div>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
