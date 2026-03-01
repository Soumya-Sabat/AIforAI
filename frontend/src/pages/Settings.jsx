import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Settings(){
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 text-white">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <div className="bg-[#0D0D14] p-6 rounded-lg border border-white/5">
            <div className="space-y-4 text-gray-300">
              <div>
                <label className="text-sm block mb-1">Name</label>
                <input className="w-full px-3 py-2 rounded bg-white/5" placeholder="Your name" />
              </div>

              <div>
                <label className="text-sm block mb-1">Email</label>
                <input className="w-full px-3 py-2 rounded bg-white/5" placeholder="email@example.com" />
              </div>

              <div>
                <button className="bg-purple-600 px-4 py-2 rounded">Save</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
