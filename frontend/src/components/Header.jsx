import React from "react";
import NotificationBell from "./NotificationBell";

export default function Header(){
  return (
    <header className="w-full bg-transparent border-b border-white/6 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        {/* mobile menu placeholder */}
        <div className="md:hidden text-white font-semibold">AI for AI</div>
        <div className="hidden md:block text-gray-300"></div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-semibold">U</div>
          <div className="text-right">
            <div className="text-sm font-medium">User Name</div>
            <div className="text-xs text-gray-400">user@example.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
