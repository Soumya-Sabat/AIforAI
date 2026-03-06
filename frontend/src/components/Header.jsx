import React from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  return (
    <header className="w-full bg-transparent border-b border-white/6 flex items-center justify-between px-4 py-3">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="md:hidden text-white font-semibold text-sm">AI for AI</div>
        <div className="hidden md:block text-gray-400 text-sm">Overview</div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-linear-to-tr from-purple-600 to-pink-500
                          flex items-center justify-center font-semibold text-sm shrink-0">
            U
          </div>
          {/* Hide name/email on very small screens */}
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium leading-tight">User Name</div>
            <div className="text-xs text-gray-400">user@example.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}