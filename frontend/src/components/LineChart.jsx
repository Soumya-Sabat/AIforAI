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

export default function LineChart({ dataSet }) {
  const [view, setView] = useState("daily");

  const chartSets = dataSet || {
    daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [2, 5, 3, 8, 6, 10, 4],
    },
    monthly: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      values: [20, 35, 40, 55, 30, 60, 70, 65, 45, 50, 30, 40],
    },
    yearly: {
      labels: ["2021","2022","2023","2024","2025"],
      values: [120, 180, 260, 300, 350],
    },
  };

  const selected = chartSets[view];
  const data = {
    labels: selected.labels,
    datasets: [
      {
        label: "Reports Submitted",
        data: selected.values,
        borderColor: "rgba(168, 85, 247, 1)",
        backgroundColor: "rgba(168, 85, 247, 0.15)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { size: 11 }, maxTicksLimit: 7 },
        grid:  { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: { color: "#9ca3af", font: { size: 11 } },
        grid:  { color: "rgba(255,255,255,0.04)" },
      },
    },
    plugins: {
      legend: { labels: { color: "#e5e7eb", font: { size: 12 }, boxWidth: 12 } },
      tooltip: { backgroundColor: "#1a1a2e", titleColor: "#a78bfa", bodyColor: "#e5e7eb" },
    },
  };

  return (
    <div className="w-full bg-[#12121C] border border-purple-900/40 rounded-xl p-3 sm:p-4">
      {/* View toggle */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap">
        {["daily", "monthly", "yearly"].map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition
              ${view === item
                ? "bg-purple-600 text-white"
                : "bg-[#1A1A24] text-purple-300 border border-purple-700/40 hover:bg-purple-800/40"}`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart — shorter on mobile */}
      <div className="h-48 sm:h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}