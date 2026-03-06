import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiGrid, FiFileText, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { RiChatAiLine } from "react-icons/ri";
import { BsFillSendFill } from "react-icons/bs";

export default function Settings() {
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
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Settings</h1>

          <div className="bg-[#0D0D14] p-4 sm:p-6 rounded-xl border border-white/5 max-w-xl w-full">
            <div className="space-y-4 text-gray-300">
              <div>
                <label className="text-sm block mb-1.5 text-gray-400">Name</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10
                             focus:outline-none focus:border-purple-500 transition text-sm text-white"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm block mb-1.5 text-gray-400">Email</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10
                             focus:outline-none focus:border-purple-500 transition text-sm text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 transition
                                   px-5 py-2.5 rounded-lg text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}