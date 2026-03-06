export default function StatCard({ title, value, note, change, changePositive = true }) {
  return (
    <div className="bg-[#0D0D14] p-3 sm:p-4 rounded-xl border border-white/10
                    hover:bg-purple-950/50 transition w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {/* Title — smaller on mobile */}
          <div className="text-xs sm:text-sm text-gray-400 font-medium truncate">{title}</div>

          {/* Value — scales down on small screens */}
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1 leading-tight">{value}</div>

          {note && (
            <div className="text-xs text-gray-500 mt-1 leading-snug">{note}</div>
          )}
        </div>

        {change !== undefined && (
          <div className="shrink-0 mt-0.5">
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium
              ${changePositive
                ? "bg-green-500/15 text-green-400 border border-green-500/20"
                : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
              {changePositive ? "▲" : "▼"} {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
  
}