import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiGrid, FiFileText, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";

export default function SubmitReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const menu = [
    { label: "Dashboard",     path: "/user/dashboard", icon: FiGrid },
    { label: "Submit Report", path: "/user/submit",    icon: BsFillSendFill },
    { label: "AI Chatbot",    path: "/user/chatbot",   icon: RiChatAiLine },
    { label: "Settings",      path: "/user/settings",  icon: FiSettings },
    { label: "Logout",        action: "logout",         icon: FiLogOut },
  ];

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen recording not supported on this device.");
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp8")
        ? "video/webm; codecs=vp8"
        : MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "";

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        setVideoURL(URL.createObjectURL(blob));
        simulateUpload();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      alert("Permission denied or no screen selected.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  const simulateUpload = () => {
    setUploaded(false);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setUploaded(true); return 100; }
        return prev + 7;
      });
    }, 120);
  };

  const uploadToBackend = async () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login again"); return; }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("description", description);
    formData.append("video", videoBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:5000/api/reports/submit", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) { alert("Server rejected request: " + result.message); return; }
      alert("Uploaded to backend successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check backend.");
    }
  };

  const handleSubmit = async () => {
    if (!prompt || !description) { alert("Prompt & Description are required!"); return; }
    if (!uploaded) { alert("Video upload (progress bar) must finish first!"); return; }
    await uploadToBackend();
    alert("Report submitted successfully!");
    setVideoBlob(null); setVideoURL(null);
    setUploadProgress(0); setUploaded(false);
    setPrompt(""); setDescription("");
  };

  const reRecord = () => {
    setVideoBlob(null); setVideoURL(null);
    setUploadProgress(0); setUploaded(false);
    startRecording();
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">
      <Sidebar menu={menu} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-[#0a0a12]/90 backdrop-blur border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition"
          >
            <FiMenu size={22} />
          </button>
          <div className="flex-1">
            <Header />
          </div>
        </div>

        {/* Main */}
        <main className="p-4 sm:p-6 md:p-8 text-white overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Submit Report</h1>

          <div className="bg-[#0D0D14] p-4 sm:p-6 rounded-xl border border-white/5 max-w-3xl w-full mx-auto">

            {/* Recording button */}
            {!recording && !videoBlob && (
              <button
                onClick={startRecording}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 transition
                           px-5 py-2.5 rounded-lg mb-5 font-medium text-sm flex items-center
                           justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-white/80" />
                Start Recording
              </button>
            )}

            {recording && (
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center gap-2 text-sm text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recording…
                </span>
                <button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 transition px-5 py-2.5
                             rounded-lg font-medium text-sm"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {/* Upload progress */}
            {videoBlob && !uploaded && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-150 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video preview */}
            {videoURL && (
              <div className="mb-5">
                <p className="text-sm text-gray-400 mb-2">Preview</p>
                <video
                  src={videoURL}
                  controls
                  className="w-full rounded-lg border border-white/10 max-h-64 sm:max-h-80 object-contain bg-black"
                />
              </div>
            )}

            {/* Re-record */}
            {videoBlob && uploaded && (
              <div className="mb-5">
                <button
                  onClick={reRecord}
                  className="w-full sm:w-auto px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700
                             transition rounded-lg text-sm font-medium"
                >
                  Re-record
                </button>
              </div>
            )}

            {/* Prompt */}
            <label className="block text-sm font-medium mb-1.5">
              Prompt <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter malicious activity detection prompt..."
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10
                         text-sm placeholder-gray-500 focus:outline-none
                         focus:border-purple-500 transition mb-4"
            />

            {/* Description */}
            <label className="block text-sm font-medium mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this report is about..."
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10
                         text-sm placeholder-gray-500 focus:outline-none
                         focus:border-purple-500 transition mb-4 resize-none"
            />

            {/* Submit */}
            {videoBlob && uploaded && (
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700
                           transition rounded-lg font-medium text-sm"
              >
                Submit Report
              </button>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}