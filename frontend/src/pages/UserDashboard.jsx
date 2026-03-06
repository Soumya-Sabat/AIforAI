import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LineChart from "../components/LineChart";
import { FiGrid, FiFileText, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";

export default function DashboardUser() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { label: "Dashboard", path: "/user/dashboard", icon: FiGrid },
    { label: "Submit Report", path: "/user/submit", icon: BsFillSendFill },
    { label: "AI Chatbot",path: "/user/chatbot", icon: RiChatAiLine },
    { label: "Settings", path: "/user/settings", icon: FiSettings },
    { label: "Logout",action: "logout", icon: FiLogOut },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">
      {/* Sidebar — receives open state + close handler */}
      <Sidebar
        menu={menu}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar with hamburger ── */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-[#0a0a12]/90 backdrop-blur border-b border-white/5">
          {/* Hamburger — hidden on large screens */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white
                       rounded-md hover:bg-white/5 transition"
          >
            <FiMenu size={22} />
          </button>

          {/* Existing Header fills the rest */}
          <div className="flex-1">
            <Header />
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="p-4 sm:p-6 md:p-10 text-white overflow-x-hidden">

          {/* Welcome + action buttons */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, <span className="text-purple-300">User</span>
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Monitor reports, submit screen recordings, and track rewards.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button className="bg-purple-600 hover:bg-purple-700 transition
                                 px-4 py-2 rounded-md text-sm sm:text-base font-medium">
                Start Chat
              </button>
              <button className="bg-transparent border border-purple-700 hover:border-purple-400
                                 transition px-4 py-2 rounded-md text-purple-300
                                 text-sm sm:text-base font-medium">
                Submit Report
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="p-4 rounded-lg bg-[#0D0D14] border border-white/5">
              <div className="text-sm text-gray-400">Total Reports</div>
              <div className="text-2xl font-bold text-purple-300">128</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D14] border border-white/5">
              <div className="text-sm text-gray-400">Malicious Found</div>
              <div className="text-2xl font-bold text-red-400">34</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0D0D14] border border-white/5">
              <div className="text-sm text-gray-400">Rewards</div>
              <div className="text-2xl font-bold text-green-400">₹1,800</div>
            </div>
          </div>

          {/* Chart + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

            <div className="lg:col-span-2 bg-[#0D0D14] p-4 rounded-lg border border-white/5">
              <h3 className="text-lg font-semibold mb-3">Activity (Daily)</h3>
              <LineChart />
            </div>

            <div className="space-y-4">
              <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-semibold mb-2">Recent Reports</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex flex-wrap gap-1">
                    <span className="text-gray-500 font-mono">#127</span>
                    <span>— Hate prompt —</span>
                    <span className="text-yellow-400">Pending</span>
                  </li>
                  <li className="flex flex-wrap gap-1">
                    <span className="text-gray-500 font-mono">#120</span>
                    <span>— Misinformation —</span>
                    <span className="text-green-400">Verified</span>
                  </li>
                  <li className="flex flex-wrap gap-1">
                    <span className="text-gray-500 font-mono">#115</span>
                    <span>— Toxic answer —</span>
                    <span className="text-red-400">Rejected</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-semibold mb-2">Reward Progress</h3>
                <div className="text-sm text-gray-300 mb-2">860 / 1000 points</div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-purple-500 rounded-full transition-all duration-700"
                    style={{ width: "86%" }}
                  />
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}