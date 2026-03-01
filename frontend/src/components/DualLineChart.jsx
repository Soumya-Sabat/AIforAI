import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function DualLineChart({ data }) {
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