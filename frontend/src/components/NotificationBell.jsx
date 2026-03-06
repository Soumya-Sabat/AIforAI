import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { id: 1, text: "Report #127 is under review", time: "2m" },
    { id: 2, text: "You earned 25 points",        time: "1h" },
  ]);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-2 rounded-full hover:bg-white/5 transition relative"
      >
        <FaBell className="text-purple-300" size={16} />
        {items.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50
                        w-[calc(100vw-2rem)] max-w-xs sm:w-80
                        bg-[#12121C] border border-purple-900/40 rounded-xl shadow-2xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-purple-200">Notifications</div>
            <button
              onClick={() => setItems([])}
              className="text-xs text-gray-400 hover:text-white transition"
            >
              Mark all read
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="p-3 bg-[#0D0D14] rounded-lg border border-white/5">
                  <div className="text-sm text-gray-200 leading-snug">{i.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{i.time} ago</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}