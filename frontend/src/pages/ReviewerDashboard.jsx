import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DualLineChart from "../components/DualLineChart";
import StatCard from "../components/StateCard";
import { FiGrid, FiFileText, FiLogOut, FiMenu } from "react-icons/fi";

export default function ReviewerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerName = user?.name || "Reviewer";

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [assignments, setAssignments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [mail, setMail]                 = useState({ to: "admin", subject: "", body: "" });
  const [sendingMail, setSendingMail]   = useState(false);
  const [lastFetchAt, setLastFetchAt]   = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { setAssignments([]); return; }
      const res = await fetch("http://localhost:5000/api/reports/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssignments(data);
      setLastFetchAt(new Date());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchReports();
    const t = setInterval(fetchReports, 600000);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => {
    const total = assignments.length;
    let suspicious = 0, notSuspicious = 0, pending = 0;
    assignments.forEach((a) => {
      const s = a.reviewDecision || "pending";
      if (s === "approved") suspicious++;
      else if (s === "rejected") notSuspicious++;
      else pending++;
    });
    const now = Date.now();
    const last24 = assignments.filter((r) => new Date(r.createdAt).getTime() > now - 86400000).length;
    const prev24 = assignments.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t <= now - 86400000 && t > now - 172800000;
    }).length;
    const pctChange = prev24 === 0 ? (last24 === 0 ? 0 : 100) : Math.round(((last24 - prev24) / prev24) * 100);
    return { total, suspicious, notSuspicious, pending, last24, prev24, pctChange };
  }, [assignments]);

  const recent3 = useMemo(() =>
    [...assignments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
  [assignments]);

  const chartDataSet = useMemo(() => {
    const days = [];
    const maliciousByDay = {}, notByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(key); maliciousByDay[key] = 0; notByDay[key] = 0;
    }
    assignments.forEach((r) => {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      const s = (r.reviewDecision || "pending").toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(maliciousByDay, day)) return;
      if (s === "approved") maliciousByDay[day]++;
      else if (s === "rejected") notByDay[day]++;
    });
    return {
      daily: {
        labels: days.map((d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
        values: days.map((d) => maliciousByDay[d]),
        values2: days.map((d) => notByDay[d]),
      },
      monthly: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"],
        values: [2,4,6,3,1,5,2],
        values2: [5,6,3,7,2,4,3],
      },
      yearly: {
        labels: ["2021","2022","2023","2024","2025"],
        values: [50,70,120,140,160],
        values2: [120,140,160,155,170],
      },
    };
  }, [assignments]);

  const updateReportStatus = async (id) => {
    const selected = statusInputs[id];
    const fb = feedbackInputs[id] || "";
    if (!selected) { alert("Please choose a decision."); return; }
    try {
      const res = await fetch(`http://localhost:5000/api/reports/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ decision: selected, feedback: fb }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setAssignments((prev) => prev.map((r) => (r._id === id ? updated : r)));
      alert("Review saved successfully");
    } catch { alert("Unable to save review"); }
  };

  const sendMail = async () => {
    if (!mail.subject.trim() || !mail.body.trim()) { alert("Enter subject and message"); return; }
    setSendingMail(true);
    try {
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mail),
      });
      if (!res.ok) { alert("Message sending failed."); }
      else { alert("Message sent"); setMail({ to: "admin", subject: "", body: "" }); }
    } catch { alert("Failed to send."); }
    finally { setSendingMail(false); }
  };

  const accuracy = (() => {
    const reviewed = assignments.filter((r) => r.reviewDecision && r.reviewDecision !== "pending");
    if (reviewed.length === 0) return 0;
    return Math.round((reviewed.filter((r) => r.reviewDecision === "approved").length / reviewed.length) * 100);
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a12] text-white">
        <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-lg animate-pulse text-purple-300">Fetching review requests…</p>
      </div>
    );
  }

  const inputCls = "w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition";

  return (
    <div className="flex min-h-screen bg-[#0a0a12]">
      <Sidebar
        menu={[
          { label: "Dashboard",         path: "/reviewer/dashboard",       icon: FiGrid },
          { label: "Reports to Review", path: "/reviewer/review-requests", icon: FiFileText },
          { label: "Logout",            action: "logout",                   icon: FiLogOut },
        ]}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3
                        bg-[#0a0a12]/90 backdrop-blur border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition"
          >
            <FiMenu size={22} />
          </button>
          <div className="flex-1"><Header /></div>
        </div>

        <main className="p-4 sm:p-6 md:p-8 text-white overflow-x-hidden">

          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {reviewerName} 👋</h1>
              <p className="text-gray-400 mt-1 text-sm">Your reviewer dashboard — keep the AI ecosystem safer.</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-400">Last updated</p>
              <p className="font-mono text-xs sm:text-sm">{lastFetchAt ? lastFetchAt.toLocaleString() : "—"}</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard title="Total Submissions" value={stats.total} note={`${stats.last24} in last 24h`} changePositive={stats.pctChange >= 0} />
            <StatCard title="Suspicious"        value={stats.suspicious}    note="Marked suspicious" />
            <StatCard title="Not Suspicious"    value={stats.notSuspicious} note="Marked safe" />
            <StatCard title="Pending Reviews"   value={stats.pending}       note="Waiting for review" />
          </div>

          {/* Recent submissions */}
          <div className="bg-[#0D0D14] p-4 sm:p-5 rounded-xl border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Submissions</h2>
              <Link to="/reviewer/reports" className="text-sm text-purple-300 underline">View all 👀</Link>
            </div>

            {recent3.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent submissions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent3.map((r) => (
                  <div key={r._id} className="bg-black/30 p-3 sm:p-4 rounded-lg border border-white/5 hover:border-purple-500/40 transition">
                    <video controls preload="metadata" className="w-full h-36 sm:h-40 rounded object-cover mb-2">
                      <source src={`http://localhost:5000/uploads/videos/${r.videoUrl}`} type="video/webm" />
                    </video>
                    <p className="text-xs text-gray-400 mb-1">{new Date(r.createdAt).toLocaleString()}</p>
                    <p className="text-sm mb-1 truncate">
                      <strong>Prompt:</strong> <span className="text-purple-200">{r.prompt}</span>
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong>{" "}
                      <span className={
                        r.reviewDecision === "approved" ? "text-green-400" :
                        r.reviewDecision === "rejected" ? "text-red-400" : "text-yellow-400"
                      }>
                        {r.reviewDecision || "pending"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart + Mailbox + Motivation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* Chart */}
            <div className="lg:col-span-2 bg-[#0D0D14] p-4 sm:p-5 rounded-xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
                <h2 className="text-base sm:text-lg font-semibold">Activity (Malicious vs Not Malicious)</h2>
                <div className="text-xs text-gray-400">Last 7 days</div>
              </div>
              <DualLineChart data={chartDataSet} />
            </div>

            {/* Mailbox + Motivation */}
            <div className="space-y-4">
              {/* Quick mail */}
              <div className="bg-[#0D0D14] p-4 sm:p-5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-1">Quick Mail</h3>
                <p className="text-xs text-gray-400 mb-3">Send a short message to Admin or User</p>
                <select className={inputCls + " mb-2"} value={mail.to} onChange={(e) => setMail((m) => ({ ...m, to: e.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="both">Admin + User</option>
                </select>
                <input className={inputCls + " mb-2"} placeholder="Subject" value={mail.subject}
                  onChange={(e) => setMail((m) => ({ ...m, subject: e.target.value }))} />
                <textarea className={inputCls + " mb-3 resize-none"} rows={3} placeholder="Message"
                  value={mail.body} onChange={(e) => setMail((m) => ({ ...m, body: e.target.value }))} />
                <button onClick={sendMail}
                  className="w-full bg-purple-600 hover:bg-purple-700 transition py-2.5 rounded-lg text-sm font-medium">
                  {sendingMail ? "Sending..." : "Send"}
                </button>
              </div>

              {/* Motivation */}
              <div className="bg-[#0D0D14] p-4 sm:p-5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-1">Motivation</h3>
                <p className="text-xs text-gray-400 mb-4">Keep the momentum — your work matters for platform safety.</p>
                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-1">Accuracy</div>
                  <div className="w-full bg-black/30 rounded-full h-2.5">
                    <div className="h-2.5 bg-green-500 rounded-full transition-all" style={{ width: `${accuracy}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{accuracy}% recent accuracy</div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Streak</div>
                  <div className="text-xl font-semibold mt-1">🔥 4 days</div>
                  <div className="text-xs text-gray-400 mt-0.5">Keep reviewing daily to increase your streak.</div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}