import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FiSend, FiAlertTriangle, FiXCircle, FiClock, FiGrid, FiFileText,
         FiUserCheck, FiEye, FiUsers, FiShield, FiActivity, FiSettings, FiMenu, FiLogOut } from "react-icons/fi";

const menu = [
  { label: "Dashboard",path: "/admin/dashboard",icon: FiGrid },
  { label: "Submissions", path: "/admin/submissions",  icon: FiFileText },
  { label: "Review Monitoring", path: "/admin/reviews", icon: FiEye },
  { label: "Users", path: "/admin/manageteam", icon: FiUsers },
  { label: "AI Governance",path: "/admin/ai-governance",icon: FiShield },
  { label: "Audit Logs", path: "/admin/audit-logs",icon: FiActivity },
  { label: "Settings", path: "/admin/settings", icon: FiSettings },
  { label: "Logout",action: "logout",icon: FiLogOut },
];

const lineOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: "#E9D5FF", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#9CA3AF", font: { size: 10 }, maxTicksLimit: 6 }, grid: { color: "rgba(255,255,255,0.05)" } },
    y: { ticks: { color: "#C4B5FD", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } },
  },
};

const barOptions = {
  responsive: true, indexAxis: "y",
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#9CA3AF", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } },
    y: { ticks: { color: "#C4B5FD", font: { size: 10 } }, grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { color: "#E9D5FF", boxWidth: 12, font: { size: 11 } } } },
};

const riskData = {
  labels: ["00:00","06:00","12:00","18:00","23:59"],
  datasets: [
    { label: "Malicious", data: [30,45,70,60,80], borderColor: "#A855F7", backgroundColor: "rgba(168,85,247,0.25)", fill: true, tension: 0.4 },
    { label: "Safe",      data: [50,75,100,120,140], borderColor: "#22D3EE", backgroundColor: "rgba(34,211,238,0.25)", fill: true, tension: 0.4 },
  ],
};

const submissionData = {
  labels: ["Oct 1","Oct 5","Oct 10","Oct 15","Oct 20","Oct 24"],
  datasets: [{ label: "Submissions", data: [40,65,55,90,85,120], borderColor: "#E9D5FF", backgroundColor: "rgba(233,213,255,0.15)", tension: 0.4 }],
};

const SkeletonCard = () => <div className="bg-white/5 rounded-xl p-5 animate-pulse h-24" />;

function ChartCard({ title, children }) {
  return (
    <div className="bg-[rgba(255,255,255,0.06)] rounded-xl p-4">
      <h2 className="font-semibold mb-4 text-sm sm:text-base">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [stats, setStats]             = useState(null);
  const [reviewerStats, setReviewerStats] = useState([]);
  const [outcomes, setOutcomes]       = useState(null);

  const reviewerChartData = reviewerStats.length ? {
    labels: reviewerStats.map(r => r.name),
    datasets: [{ data: reviewerStats.map(r => r.reviewCount), backgroundColor: "#22D3EE", borderRadius: 8 }],
  } : null;

  const outcomeChartData = outcomes ? {
    labels: ["Approved","Rejected","Pending"],
    datasets: [{ data: [outcomes.approved, outcomes.rejected, outcomes.pending],
      backgroundColor: ["#22C55E","#EF4444","#FACC15"], borderWidth: 0, cutout: "60%" }],
  } : null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [sR, rR, oR] = await Promise.all([
          fetch("http://localhost:5000/api/admin/dashboard-stats", { headers }),
          fetch("http://localhost:5000/api/admin/reviewer-performance", { headers }),
          fetch("http://localhost:5000/api/admin/review-outcomes", { headers }),
        ]);
        setStats(await sR.json());
        setReviewerStats(await rR.json());
        setOutcomes(await oR.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  const topCards = stats ? [
    { title: "Total Submissions", value: stats.totalSubmissions, color: "#A855F7", icon: FiFileText },
    { title: "Pending Reviews",   value: stats.pendingReviews,   color: "#FACC15", icon: FiAlertTriangle },
    { title: "Malicious Reports", value: stats.maliciousReports, color: "#EF4444", icon: FiXCircle },
    { title: "Not Malicious",     value: stats.safeReports,      color: "#22C55E", icon: FiShield },
  ] : [];

  const bottomCards = stats ? [
    { title: "Peer Reviewers",  value: stats.peerCount,          color: "#22D3EE", icon: FiUserCheck },
    { title: "Total Users",     value: stats.totalUsers,          color: "#A855F7", icon: FiUsers },
    { title: "Avg Review Time", value: `${stats.avgReviewTimeHours} hrs`, color: "#C4B5FD", icon: FiClock },
  ] : [];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar menu={menu} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-black/90 backdrop-blur border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition">
            <FiMenu size={22} />
          </button>
          <div className="flex-1"><Header /></div>
        </div>

        <div className="p-4 sm:p-6 bg-black text-[#E9D5FF] space-y-6 sm:space-y-8 overflow-x-hidden">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, <span className="text-[#A855F7]">Admin</span>
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1">
              AI Governance Oversight: <span className="text-[#22D3EE]">System Nominal</span>
            </p>
          </div>

          {/* KPI cards — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : topCards.map(({ title, value, color, icon: Icon }, i) => (
                <div key={i} className="relative bg-[rgba(255,255,255,0.06)] rounded-xl p-4 sm:p-5
                                        flex justify-between items-center transition hover:scale-[1.03]">
                  <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition"
                       style={{ boxShadow: `0 0 25px ${color}` }} />
                  <div className="relative min-w-0">
                    <p className="text-xs sm:text-sm text-[#C4B5FD] truncate">{title}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#E9D5FF] mt-1">{value}</h2>
                  </div>
                  <div className="relative p-2.5 sm:p-4 rounded-xl animate-pulse shrink-0"
                       style={{ backgroundColor: `${color}22` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                </div>
              ))}
          </div>

          {/* Bottom cards — 1 col mobile, 3 cols md+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {loading
              ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
              : bottomCards.map(({ title, value, color, icon: Icon }, i) => (
                <div key={i} className="relative group bg-[rgba(255,255,255,0.06)] rounded-xl p-4 sm:p-5
                                        flex justify-between items-center overflow-hidden hover:bg-[rgba(78,12,120,0.5)] transition">
                  <div className="absolute left-0 top-0 h-full w-1 scale-y-0 group-hover:scale-y-100
                                  transition-transform duration-300 origin-top"
                       style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-xs sm:text-sm text-[#9CA3AF]">{title}</p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#E9D5FF] mt-1">{value}</h2>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg animate-pulse shrink-0"
                       style={{ backgroundColor: `${color}29` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                </div>
              ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartCard title="Report Risk Analysis"><Line data={riskData} options={lineOptions} /></ChartCard>
            <ChartCard title="Submission Rate"><Line data={submissionData} options={lineOptions} /></ChartCard>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChartCard title="Reviewer Performance">
              {reviewerChartData && <Bar data={reviewerChartData} options={barOptions} />}
            </ChartCard>
            <ChartCard title="Review Outcomes">
              <div className="h-64 sm:h-72">
                {outcomeChartData && <Doughnut data={outcomeChartData} options={doughnutOptions} />}
              </div>
            </ChartCard>
          </div>

          {/* Announcement */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-[rgba(255,255,255,0.06)] rounded-2xl p-5 sm:p-6
                            hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition">
              <h2 className="text-base sm:text-lg font-semibold mb-4 text-center">Admin Announcement</h2>
              <select className="w-full mb-3 bg-black border border-[#A855F7] rounded-lg p-2 text-sm">
                <option>Everyone</option>
                <option>All Peer Reviewers</option>
                <option>All Users</option>
              </select>
              <textarea className="w-full h-28 sm:h-32 bg-black border border-[#A855F7] rounded-lg p-3 text-sm resize-none"
                        placeholder="Type message..." />
              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-[#A855F7]
                                 text-black py-2.5 rounded-lg hover:bg-[#22D3EE] transition font-semibold text-sm">
                <FiSend /> Send Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}