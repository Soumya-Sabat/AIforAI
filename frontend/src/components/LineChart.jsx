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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function DualLineChartWrapper({ data }) {
  // pick daily dataset
  const daily = data.daily;
  const labels = daily.labels;
  const malicious = daily.values;
  const notmal = daily.values2;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Malicious",
        data: malicious,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Not Malicious",
        data: notmal,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.12)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: { ticks: { color: "#cfcfcf" }, grid: { color: "rgba(255,255,255,0.03)" } },
      y: { ticks: { color: "#cfcfcf" }, grid: { color: "rgba(255,255,255,0.03)" } },
    },
  };

  return <div className="h-56"><Line data={chartData} options={options} /></div>;
}

export default function LineChart({ dataSet }) {
  const [view, setView] = useState("daily");

  // If parent didn’t pass data, fallback to defaults
  const chartSets = dataSet || {
    daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [2, 5, 3, 8, 6, 10, 4],
    },
    monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [20, 35, 40, 55, 30, 60, 70, 65, 45, 50, 30, 40],
    },
    yearly: {
      labels: ["2021", "2022", "2023", "2024", "2025"],
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
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#cfcfcf" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#cfcfcf" },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
    plugins: {
      legend: { labels: { color: "white" } },
    },
  };

  return (
    <div className="w-full bg-[#12121C] border border-purple-900/40 rounded-lg p-4">
      <div className="flex gap-4 mb-4">
        {["daily", "monthly", "yearly"].map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`px-4 py-1 rounded-md text-sm font-semibold transition
              ${view === item
                ? "bg-purple-600 text-white"
                : "bg-[#1A1A24] text-purple-300 border border-purple-700/40 hover:bg-purple-800/40"}`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
