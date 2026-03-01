import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LineChart from "../components/LineChart";
import { FiGrid, FiFileText, FiSettings, FiLogOut  } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";
export default function DashboardUser(){

  const menu = [
    { label: "Dashboard", path: "/user/dashboard", icon: FiGrid},
    { label: "Submit Report", path: "/user/submit" , icon: BsFillSendFill},
    // { label: "Manage Reports", path: "/user/manage", icon: FiFileText },
    { label: "AI Chatbot", path: "/user/chatbot", icon: RiChatAiLine },
    { label: "Settings", path: "/user/settings", icon: FiSettings },
    { label: "Logout", action: "logout", icon: FiLogOut },
  ];
  return (
    <div className="flex min-h-screen">
      <Sidebar menu={menu} />
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 md:p-10 text-white">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, <span className="text-purple-300">User</span></h1>
              <p className="text-gray-400 mt-1">Monitor reports, submit screen recordings, and track rewards.</p>
            </div>

            <div className="flex gap-3">
              <button className="bg-purple-600 px-4 py-2 rounded-md">Start Chat</button>
              <button className="bg-transparent border border-purple-700 px-4 py-2 rounded-md text-purple-300">Submit Report</button>
            </div>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

          {/* chart & recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0D0D14] p-4 rounded-lg border border-white/5">
              <h3 className="text-lg font-semibold mb-3">Activity (Daily)</h3>
              <LineChart />
            </div>

            <div className="space-y-4">
              <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-semibold mb-2">Recent Reports</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>#127 — Hate prompt — Pending</li>
                  <li>#120 — Misinformation — Verified</li>
                  <li>#115 — Toxic answer — Rejected</li>
                </ul>
              </div>

              <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-semibold mb-2">Reward Progress</h3>
                <div className="text-sm text-gray-300 mb-2">860 / 1000 points</div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div className="h-3 bg-purple-500" style={{ width: "86%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
