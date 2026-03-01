import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FiGrid, FiFileText, FiUserCheck, FiEye, FiCheckCircle, FiUsers, FiShield, FiActivity, FiSettings } from "react-icons/fi";
const menu = [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Submissions", path: "/admin/submissions", icon: FiFileText },
    // { label: "Assign Reviews", path: "/admin/assign-reviews", icon: FiUserCheck },
    { label: "Review Monitoring", path: "/admin/reviews", icon: FiEye },  //admin reviews
    // { label: "Final Decisions", path: "/admin/decisions", icon: FiCheckCircle },
    { label: "Users", path: "/admin/manageteam", icon: FiUsers },
    { label: "AI Governance", path: "/admin/ai-governance", icon: FiShield },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: FiActivity },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
     { label: "Logout", action: "logout", icon: FiSettings },
  ];
export default function AdminSubmissions() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:5000/api/reports/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setReports(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-purple-400 text-lg">
        Loading submissions...
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No submissions available.
      </div>
    );
  }

  return (
     <div className="flex min-h-screen">
          <Sidebar menu={menu} />
          <div className="flex-1">
            <Header />
    <div className="p-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">
          All Evaluated Submissions
        </h1>
        <p className="text-sm text-gray-400">
          View final review status and feedback
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((r) => (
          <div
            key={r._id}
            className="bg-[#0D0D14] border border-white/10 rounded-xl p-4
                       hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]
                       transition duration-300"
          >
            {/* Date */}
            <div className="text-xs text-gray-400 mb-2">
              {new Date(r.createdAt).toLocaleString()}
            </div>

            {/* Video */}
            <video
              src={`http://localhost:5000${r.videoUrl}`}
              controls
              className="w-full rounded-lg mb-3"
            />

            {/* Prompt */}
            <div className="text-sm mb-2">
              <span className="text-purple-400 font-semibold">Prompt:</span>
              <p className="text-gray-200">{r.prompt}</p>
            </div>

            {/* Description */}
            <div className="text-sm mb-3">
              <span className="text-purple-400 font-semibold">
                Description:
              </span>
              <p className="text-gray-300">{r.description}</p>
            </div>

            {/* Status */}
            <div className="text-sm mb-2">
              <span className="font-semibold text-purple-400">Status:</span>{" "}
              <span
                className={`font-semibold ${
                  r.status === "approved"
                    ? "text-green-400"
                    : r.status === "rejected"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {r.status || "pending"}
              </span>
            </div>

            {/* Feedback */}
            {r.feedback && (
              <div className="text-sm bg-black/30 p-3 rounded-lg border border-white/10">
                <span className="text-purple-400 font-semibold">
                  Feedback:
                </span>
                <p className="text-gray-300 mt-1">{r.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
  );
}
