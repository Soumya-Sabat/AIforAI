import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiGrid, FiFileText, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";

const reports = [
  { id: "#127", title: "Hate prompt",    status: "Pending",  date: "2025-11-30" },
  { id: "#120", title: "Misinformation", status: "Verified", date: "2025-11-25" },
  { id: "#115", title: "Toxic answer",   status: "Rejected", date: "2025-11-20" },
];

const statusStyle = {
  Pending:  "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  Verified: "text-green-400 bg-green-400/10 border border-green-400/20",
  Rejected: "text-red-400 bg-red-400/10 border border-red-400/20",
};

export default function ManageReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { label: "Dashboard",     path: "/user/dashboard", icon: FiGrid },
    { label: "Submit Report", path: "/user/submit",    icon: BsFillSendFill },
    { label: "AI Chatbot",    path: "/user/chatbot",   icon: RiChatAiLine },
    { label: "Settings",      path: "/user/settings",  icon: FiSettings },
    { label: "Logout",        action: "logout",         icon: FiLogOut },
  ];

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
          <div className="flex-1"><Header /></div>
        </div>

        <main className="p-4 sm:p-6 md:p-8 text-white overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Manage Reports</h1>

          <div className="bg-[#0D0D14] rounded-xl border border-white/5 overflow-hidden">

            {/* ── Desktop table (sm and up) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-white/3 transition">
                      <td className="px-5 py-3.5 font-mono text-gray-400 text-xs">{r.id}</td>
                      <td className="px-5 py-3.5 font-medium">{r.title}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards (below sm) ── */}
            <div className="sm:hidden divide-y divide-white/5">
              {reports.map((r) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gray-400 text-xs">{r.id}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-gray-200 font-medium text-sm">{r.title}</p>
                  <p className="text-gray-500 text-xs">{r.date}</p>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}