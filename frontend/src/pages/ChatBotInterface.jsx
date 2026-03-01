import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/chatbot";

// Get JWT token stores it

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});


function Message({ msg }) {
  const { role, content } = msg;

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-purple-600 p-4 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  if (role === "blocked") {
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 mt-1">
            <ShieldIcon />
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl rounded-tl-sm">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-1">
              ⚠ Safety Filter
            </p>
            <p className="text-sm text-red-300 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (role === "error") {
    return (
      <div className="flex justify-start">
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl rounded-tl-sm max-w-[80%]">
          <p className="text-sm text-yellow-300 leading-relaxed">⚠ {content}</p>
        </div>
      </div>
    );
  }

  // AI
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
          <AIIcon />
        </div>
        <div className="bg-[#1C1C28] border border-white/10 p-4 rounded-2xl rounded-tl-sm">
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            AI for AI
          </p>
          <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}


function TypingIndicator({ status }) {
  if (status === "idle") return null;
  return (
    <div className="flex justify-start">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
          <AIIcon />
        </div>
        <div className="bg-[#1C1C28] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
          {status === "scanning" ? (
            <>
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full animate-[scanAnim_1s_ease-in-out_infinite_alternate]" />
              </div>
              <span className="text-xs text-gray-500">Safety scanning...</span>
            </>
          ) : (
            <>
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-xs text-gray-500">Thinking......</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatBotInterface() {
  const [messages, setMessages]= useState([]);
  const [input, setInput]= useState("");
  const [status, setStatus]= useState("idle"); 
  const [showReport, setShowReport]= useState(false);
  const [file, setFile]= useState(null);
  const [reportStatus, setReportStatus] = useState("idle");

  const bottomRef= useRef(null);
  const inputRef= useRef(null);
  const fileInputRef = useRef(null);

 
  useEffect(() => {
    const loadHistory = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`${API_BASE}/history`, {
          headers: authHeaders(),
        });

        if (res.status === 401) {
          setStatus("idle");
          return;
        }

        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages.map((m) => ({
            ...m,
            id: Math.random(),
          })));
        }
      } catch (err) {
        console.error("Failed to load history:", err.message);
      } finally {
        setStatus("idle");
      }
    };

    loadHistory();
  }, []);

  // Autoscroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  };

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || status !== "idle") return;

    setInput("");
    addMessage({ role: "user", content: prompt });

    try {
      setStatus("scanning");

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.message || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (data.blocked) {
        setStatus("idle");
        addMessage({ role: "blocked", content: data.reply });
      } else {
        setStatus("thinking");
        await new Promise((r) => setTimeout(r, 400));
        setStatus("idle");
        addMessage({ role: "assistant", content: data.reply });
      }
    } catch (error) {
      setStatus("idle");
      addMessage({
        role: "error",
        content: error.message.includes("Failed to fetch")
          ? "Cannot connect to backend. Make sure the server is running."
          : error.message,
      });
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear chat deletes from MongoDB 
  const clearChat = async () => {
    try {
      await fetch(`${API_BASE}/history`, {
        method: "DELETE",
        headers: authHeaders(),
      });
    } catch (err) {
      console.error("Failed to clear history:", err.message);
    }
    setMessages([]);
  };

  //Report submit
  const handleReportSubmit = async () => {
    if (!file) return;
    setReportStatus("uploading");
    // TODO: wire to your actual report upload endpoint
    await new Promise((r) => setTimeout(r, 1500));
    setReportStatus("done");
    setTimeout(() => {
      setShowReport(false);
      setFile(null);
      setReportStatus("idle");
    }, 1800);
  };

  const isProcessing = status === "scanning" || status === "thinking";
  const isLoading    = status === "loading";

  return (
    <div className="min-h-screen bg-[#050510] text-white flex">

      {/* SIDEBAR*/}
      <aside className="w-64 h-screen bg-[#0D0D18] border-r border-white/5 p-6 hidden md:flex flex-col justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold mb-8">AI for AI</h1>

          <nav className="space-y-3">
            <Link
              to="/user/dashboard"
              className="block px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 duration-200 text-sm"
            >
              Home
            </Link>

            <button
              onClick={() => setShowReport(true)}
              className="block w-full text-left px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/40 hover:border-purple-400 duration-200 text-sm"
            >
              Report to us
            </button>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30 duration-200 text-sm text-gray-400"
              >
                Clear Chat
              </button>
            )}
          </nav>

          {/* Safety indicator */}
          <div className="mt-8 px-4 py-3 bg-white/3 rounded-lg border border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-medium">Protection</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-xs text-gray-400">Safety filter active</span>
            </div>
          </div>

          {/* History indicator */}
          <div className="mt-3 px-4 py-3 bg-white/3 rounded-lg border border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-medium">History</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              <span className="text-xs text-gray-400">
                {messages.length > 0 ? `${messages.length} messages saved` : "No history yet"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600">© 2025 AI for AI</p>
      </aside>

      {/*MAIN CHAT*/}
      <main className="flex-1 flex flex-col h-screen min-w-0">

        {/* Mobile header */}
        <header className="md:hidden w-full px-6 py-4 backdrop-blur bg-[#0D0D18]/80 border-b border-white/10 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold">AI for AI</h1>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 px-3 py-1.5 border border-white/10 rounded-lg hover:border-red-500/30 hover:text-red-400 duration-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowReport(true)}
              className="bg-purple-600 px-4 py-2 rounded-md text-white font-medium text-sm"
            >
              Report
            </button>
          </div>
        </header>

        {/*Chat display */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Loading history spinner */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin w-7 h-7 text-purple-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <p className="text-xs text-gray-500">Loading your chat history...</p>
                </div>
              </div>
            )}

            {/* Welcome state */}
            {!isLoading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">How can I help you?</h2>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Every message is screened by a safety filter before reaching the AI model.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    "Explain how AI safety works",
                    "Write a Python function",
                    "What is machine learning?",
                    "Help me debug my code",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs px-4 py-2 border border-white/10 rounded-full text-gray-400 hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-500/5 duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!isLoading && messages.map((msg) => (
              <Message key={msg.id} msg={msg} />
            ))}

            {/* Scanning / thinking indicator */}
            <TypingIndicator status={isLoading ? "idle" : status} />

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input bar ── */}
        <div className="shrink-0 w-full px-4 py-4 bg-[#0D0D18]/80 backdrop-blur border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className={`flex items-end gap-3 bg-[#1C1C28] px-4 py-3 rounded-xl border transition-all duration-200 ${
              isProcessing || isLoading
                ? "border-white/5 opacity-60"
                : "border-white/10 focus-within:border-purple-500/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            }`}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                onKeyDown={handleKeyDown}
                disabled={isProcessing || isLoading}
                placeholder="Message AI for AI..."
                className="flex-1 bg-transparent text-white text-sm leading-relaxed resize-none outline-none placeholder-gray-600 max-h-36 min-h-6"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                onClick={sendMessage}
                disabled={isProcessing || isLoading || !input.trim()}
                className="shrink-0 bg-purple-600 hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-semibold text-sm duration-200 flex items-center gap-2"
              >
                {isProcessing ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
                Send
              </button>
            </div>
            <p className="text-center text-xs text-gray-700 mt-2">
              Enter to send · Shift+Enter for new line · History saved automatically
            </p>
          </div>
        </div>
      </main>

      {/* ── REPORT MODAL ── */}
      {showReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0D0D18] p-8 rounded-xl border border-purple-500/30 w-full max-w-lg shadow-2xl">

            {reportStatus === "done" ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Report Submitted!</h2>
                <p className="text-gray-400 text-sm">Your video has been received and will be reviewed.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2">Report an Issue</h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Upload a screen recording (.mp4, .mkv, .webm) to report suspicious or harmful chatbot activity.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full mb-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    file ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-purple-500/30 hover:bg-white/2"
                  }`}
                >
                  {file ? (
                    <div>
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                      </div>
                      <p className="text-purple-400 text-sm font-medium">{file.name}</p>
                      <p className="text-gray-600 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">Click to upload video</p>
                      <p className="text-gray-600 text-xs mt-1">MP4, MKV, WEBM supported</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => { setShowReport(false); setFile(null); setReportStatus("idle"); }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    disabled={!file || reportStatus === "uploading"}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold text-sm duration-200 flex items-center gap-2"
                  >
                    {reportStatus === "uploading" && (
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    )}
                    {reportStatus === "uploading" ? "Uploading..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AIIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}