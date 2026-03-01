import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiGrid, FiFileText, FiSettings, FiLogOut  } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";

export default function SubmitReport() {
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
      { label: "Dashboard", path: "/user/dashboard", icon: FiGrid},
      { label: "Submit Report", path: "/user/submit" , icon: BsFillSendFill},
      // { label: "Manage Reports", path: "/user/manage", icon: FiFileText },
      { label: "AI Chatbot", path: "/user/chatbot", icon: RiChatAiLine },
      { label: "Settings", path: "/user/settings", icon: FiSettings },
      { label: "Logout", action: "logout", icon: FiLogOut },
    ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
  mimeType: "video/webm; codecs=vp8"
});

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
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  // Fake progress bar animation (only UI)
  const simulateUpload = () => {
    setUploaded(false);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploaded(true);
          return 100;
        }
        return prev + 7;
      });
    }, 120);
  };

  // === Upload to backend ===
  const uploadToBackend = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again");
    return;
  }

  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("description", description);
  formData.append("video", videoBlob, "recording.webm");

  try {
    const response = await fetch("http://localhost:5000/api/reports/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: formData,
    });

    const result = await response.json();
    console.log("Backend Response:", result);

    if (!response.ok) {
      alert("Server rejected request: " + result.message);
      return;
    }

    alert("Uploaded to backend successfully!");
  } catch (err) {
    console.error(err);
    alert("Upload failed. Check backend.");
  }
};


  const handleSubmit = async () => {
    if (!prompt || !description) {
      alert("Prompt & Description are required!");
      return;
    }
    if (!uploaded) {
      alert("Video upload (progress bar) must finish first!");
      return;
    }

    await uploadToBackend();

    alert("Report submitted successfully!");

    // Reset page
    setVideoBlob(null);
    setVideoURL(null);
    setUploadProgress(0);
    setUploaded(false);
    setPrompt("");
    setDescription("");
  };

  const reRecord = () => {
    setVideoBlob(null);
    setVideoURL(null);
    setUploadProgress(0);
    setUploaded(false);
    startRecording();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar menu={menu} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-8 text-white">
          <h1 className="text-2xl font-bold mb-4">Submit Report</h1>

          <div className="bg-[#0D0D14] p-6 rounded-lg border border-white/5">

            {/* START / STOP BUTTON */}
            {!recording && !videoBlob && (
              <button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md mb-4"
              >
                Start Recording
              </button>
            )}

            {recording && (
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md mb-4"
              >
                Stop Recording
              </button>
            )}

            {/* Upload Progress */}
            {videoBlob && !uploaded && (
              <div className="w-full bg-gray-700 h-3 rounded-lg overflow-hidden mb-4">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Preview */}
            {videoURL && (
              <>
                <p className="mb-2">Preview:</p>
                <video src={videoURL} controls className="w-100 rounded-lg mb-4" />
              </>
            )}

            {videoBlob && uploaded && (
              <div className="flex gap-4 mt-4 mb-4">
                <button
                  onClick={reRecord}
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md"
                >
                  Re-record
                </button>
              </div>
            )}

            <label className="block mb-2 mt-4">
              Prompt <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter malicious activity detection prompt..."
              className="w-full p-3 rounded bg-black/40 border border-white/10 mb-4"
            />

            <label className="block mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this report is about..."
              className="w-full p-3 rounded bg-black/40 border border-white/10 mb-4"
            />

            {videoBlob && uploaded && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Submit Report
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
