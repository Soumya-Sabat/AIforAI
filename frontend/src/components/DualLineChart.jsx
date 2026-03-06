import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function DualLineChart({ data }) {
  const [view, setView] = useState("daily");

  // Support both {daily,monthly,yearly} shape and plain {labels,values,values2}
  const isMultiView = data && data.daily && data.monthly;
  const dataset = isMultiView ? data[view] : data?.daily || data;

  const labels    = dataset?.labels   || [];
  const malicious = dataset?.values   || [];
  const notmal    = dataset?.values2  || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Malicious",
        data: malicious,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: "Not Malicious",
        data: notmal,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb", font: { size: 11 }, boxWidth: 12, padding: 12 },
      },
      tooltip: { backgroundColor: "#1a1a2e", titleColor: "#a78bfa", bodyColor: "#e5e7eb" },
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { size: 10 }, maxTicksLimit: 7 },
        grid:  { color: "rgba(255,255,255,0.03)" },
      },
      y: {
        ticks: { color: "#9ca3af", font: { size: 10 } },
        grid:  { color: "rgba(255,255,255,0.03)" },
      },
    },
  };

  return (
    <div className="w-full">
      {/* View switcher — only shown when multi-view data is available */}
      {isMultiView && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {["daily", "monthly", "yearly"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition
                ${view === v
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}
      {/* Chart — shorter on mobile */}
      <div className="h-44 sm:h-56">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}