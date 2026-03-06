import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FiGrid, FiFileText, FiEye, FiUsers, FiShield, FiActivity, FiSettings, FiMenu, FiLogOut } from "react-icons/fi";

const menu = [
  { label: "Dashboard",path: "/admin/dashboard",icon: FiGrid },
  { label: "Submissions", path: "/admin/submissions",  icon: FiFileText },
  { label: "Review Monitoring", path: "/admin/reviews", icon: FiEye },
  { label: "Users", path: "/admin/manageteam", icon: FiUsers },
  { label: "AI Governance",path: "/admin/ai-governance",icon: FiShield },
  { label: "Audit Logs", path: "/admin/audit-logs",icon: FiActivity },
  { label: "Settings", path: "/admin/settings", icon: FiSettings },
  { label: "Logout",action: "logout",icon: FiLogOut },
];

const statusColor = (s) =>
  s === "approved" ? "text-green-400" : s === "rejected" ? "text-red-400" : "text-yellow-400";

export default function AdminSubmissions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/reports/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setReports(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">
      <Sidebar menu={menu} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-[#0a0a12]/90 backdrop-blur border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition">
            <FiMenu size={22} />
          </button>
          <div className="flex-1"><Header /></div>
        </div>

        <div className="p-4 sm:p-6 text-white overflow-x-hidden">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-purple-300">All Evaluated Submissions</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">View final review status and feedback</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40 text-purple-400">Loading submissions...</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">No submissions available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {reports.map((r) => (
                <div key={r._id}
                  className="bg-[#0D0D14] border border-white/10 rounded-xl p-4
                             hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition duration-300">
                  {/* Date */}
                  <div className="text-xs text-gray-400 mb-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>

                  {/* Video */}
                  <video src={`http://localhost:5000${r.videoUrl}`} controls
                    className="w-full rounded-lg mb-3 max-h-48 object-cover bg-black" />

                  {/* Prompt */}
                  <div className="text-sm mb-2">
                    <span className="text-purple-400 font-semibold">Prompt: </span>
                    <p className="text-gray-200 mt-0.5">{r.prompt}</p>
                  </div>

                  {/* Description */}
                  <div className="text-sm mb-3">
                    <span className="text-purple-400 font-semibold">Description: </span>
                    <p className="text-gray-300 mt-0.5">{r.description}</p>
                  </div>

                  {/* Status */}
                  <div className="text-sm mb-2 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-purple-400">Status:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
                      ${r.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        r.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                      {r.status || "pending"}
                    </span>
                  </div>

                  {/* Feedback */}
                  {r.feedback && (
                    <div className="text-sm bg-black/30 p-3 rounded-lg border border-white/10">
                      <span className="text-purple-400 font-semibold">Feedback: </span>
                      <p className="text-gray-300 mt-1 text-xs">{r.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}