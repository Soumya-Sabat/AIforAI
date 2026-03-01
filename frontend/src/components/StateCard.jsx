export default function StatCard({ title, value, note, change, changePositive = true }) {
  return (
    <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/10 hover:bg-purple-950 transition w-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-white">{title}</div>
          <div className="text-2xl font-semibold text-white p-3">{value}</div>
          {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
        </div>

        {change !== undefined && (
          <div className="text-right">
            <div className={`px-2 py-1 rounded ${changePositive ? "bg-green-800 text-green-300" : "bg-red-800 text-red-300"}`}>
              {change}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}