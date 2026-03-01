


import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LineChart from "../components/LineChart";
import DualLineChart from "../components/DualLineChart";
import StatCard from "../components/StateCard";
import { color } from "framer-motion";
import { FiGrid, FiFileText, FiLogOut } from "react-icons/fi";

export default function ReviewerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerName = user?.name || "Reviewer";
 const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [statusInputs, setStatusInputs] = useState({});
  const [mail, setMail] = useState({ to: "admin", subject: "", body: "" });
  const [sendingMail, setSendingMail] = useState(false);
  const [lastFetchAt, setLastFetchAt] = useState(null);

  // fetch reports
 const fetchReports = async () => {

  try {
    setLoading(true);
     const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      setAssignments([]);
      return;
    }
    const res = await fetch("http://localhost:5000/api/reports/all", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setAssignments(data);
    setLastFetchAt(new Date());
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchReports();
    const t = setInterval(fetchReports, 600000); // refresh every 10 minutes
    return () => clearInterval(t);
  }, []);

  // Derived statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    let suspicious = 0; // we treat status === 'approved' as malicious/suspicious
    let notSuspicious = 0; // status === 'rejected'
    let pending = 0;
    assignments.forEach((assignment) => {
      const s = assignment.reviewDecision || "pending";
      if (s === "approved") suspicious++;
      else if (s === "rejected") notSuspicious++;
      else pending++;
    });

    // simple percentage change calculations (compare last 24h vs previous 24h)
    const now = Date.now();
    const last24 = assignments.filter((r) => new Date(r.createdAt).getTime() > now - 24 * 3600 * 1000).length;
    const prev24 = assignments.filter(
      (r) =>
        new Date(r.createdAt).getTime() <= now - 24 * 3600 * 1000 &&
        new Date(r.createdAt).getTime() > now - 48 * 3600 * 1000
    ).length;

    const pctChange = prev24 === 0 ? (last24 === 0 ? 0 : 100) : Math.round(((last24 - prev24) / prev24) * 100);

    return {
      total,
      suspicious,
      notSuspicious,
      pending,
      last24,
      prev24,
      pctChange,

    };
  }, [assignments]);

  const recent3 = useMemo(() => {
    return [...assignments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  }, [assignments]);

  // Prepare chart dataset: daily counts for last 7 days (malicious vs not)
  const chartDataSet = useMemo(() => {
    // helper: get label days
    const days = [];
    const maliciousByDay = {};
    const notByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
      days.push(key);
      maliciousByDay[key] = 0;
      notByDay[key] = 0;
    }

    assignments.forEach((r) => {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      const s = (r.reviewDecision || "pending").toLowerCase();
      if (!maliciousByDay.hasOwnProperty(day)) return;
      if (s === "approved") maliciousByDay[day]++;
      else if (s === "rejected") notByDay[day]++;
    });

    return {
      daily: {
        labels: days.map((d) => {
          const dd = new Date(d);
          return dd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }),
        // note: LineChart expects { labels, values } for each view
        malicious: days.map((d) => maliciousByDay[d]),
        notmalicious: days.map((d) => notByDay[d]),
        // For compatibility with your reusable LineChart which expects labels/values for each named view,
        // we'll create a dataset where "daily" has combined difference (we'll supply malicious values as primary).
      },
      // also provide monthly/yearly stubs (you can compute similarly if you want)
      monthly: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        malicious: [2, 4, 6, 3, 1, 5, 2],
        notmalicious: [5, 6, 3, 7, 2, 4, 3],
      },
    };
  }, [assignments]);

 
  const lineChartDataSet = useMemo(() => {
   
    return {
      daily: {
        labels: chartDataSet.daily.labels,
        values: chartDataSet.daily.malicious, // main line (malicious)
        values2: chartDataSet.daily.notmalicious, // secondary line (not malicious)
      },
      monthly: {
        labels: chartDataSet.monthly.labels,
        values: chartDataSet.monthly.malicious,
        values2: chartDataSet.monthly.notmalicious,
      },
      yearly: {
        labels: ["2021", "2022", "2023", "2024", "2025"],
        values: [50, 70, 120, 140, 160],
        values2: [120, 140, 160, 155, 170],
      },
    };
  }, [chartDataSet]);

  // update handlers for reviewer approve/reject
  const updateReportStatus = async (id) => {
  const selected = statusInputs[id];
  const fb = feedbackInputs[id] || "";

  if (!selected) {
    alert("Please choose a decision.");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/reports/review/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          decision: selected,
          feedback: fb,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to update status");

    const updated = await res.json();

    setAssignments((prev) =>
      prev.map((r) => (r._id === id ? updated : r))
    );

    alert("Review saved successfully");
  } catch (err) {
    console.error(err);
    alert("Unable to save review");
  }
};

  // mailbox send (simple)
  const sendMail = async () => {
    if (!mail.subject.trim() || !mail.body.trim()) {
      alert("Enter subject and message");
      return;
    }
    setSendingMail(true);
    try {
      // your backend should provide /api/messages (or /api/notify). Fallback: just simulate.
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mail),
      });
      if (!res.ok) {
        // Fake success if endpoint missing
        const text = await res.text().catch(() => "");
        console.warn("Mail endpoint returned:", text);
        alert("Message sending failed (backend). Saved to outbox locally.");
      } else {
        alert("Message sent");
        setMail({ to: "admin", subject: "", body: "" });
      }
    } catch (err) {
      console.error("Send mail error", err);
      alert("Failed to send (server unreachable).");
    } finally {
      setSendingMail(false);
    }
  };

  // small UI while loading
   if (loading) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg animate-pulse text-purple-300">
        Fetching review requests…
      </p>
    </div>
  );
}

  // helper to compute simple accuracy (example: proportion of reviews that are final and approved or rejected)
  const accuracy = (() => {
    const reviewed = assignments.filter((r) => r.reviewDecision && r.reviewDecision !== "pending");
    if (reviewed.length === 0) return 0;
    // For demonstration, treat approved as 'correct' randomly — replace with real ground truth
    const score = Math.round((reviewed.filter((r) => r.reviewDecision === "approved").length / reviewed.length) * 100);
    return score;
  })();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        menu={[
          { label: "Dashboard", path: "/reviewer/dashboard" , icon: FiGrid},
          { label: "Reports to Review", path: "/reviewer/review-requests", icon: FiFileText},
          { label: "Logout", action: "logout", icon: FiLogOut},
        ]}
      />

      <div className="flex-1">
        <Header />

        <main className="p-8 text-white">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {reviewerName} 👋</h1>
              <p className="text-gray-400 mt-1">Your reviewer dashboard — keep the AI ecosystem safer.</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Last updated</p>
              <p className="font-mono text-sm">{lastFetchAt ? lastFetchAt.toLocaleString() : "—"}</p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Submissions"
              value={stats.total}
              note={`${stats.last24} in last 24h`}
              //change={`${stats.pctChange}%`}
              changePositive={stats.pctChange >= 0}
            />
            <StatCard className="text-red-400"
              title="Suspicious"
              value={stats.suspicious}
              note="Marked suspicious"
              //change="—"
            />
            <StatCard
              title="Not Suspicious"
              value={stats.notSuspicious}
              note="Marked safe"
              //change="—"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pending}
              note="Waiting for review"
              //change="—"
            />
          </div>

          {/* Recent + Chart + Mailbox */}
          <div className="grid grid-cols-1 lg:grid-rows-2 gap-6 mb-6 justify-center">
            {/* Recent 3 */}
            <div className="bg-[#0D0D14] p-5 rounded-lg border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Submissions</h2>
                <Link to="/reviewer/reports" className="text-sm text-purple-300 underline">View all👀</Link>
              </div>

              {recent3.length === 0 ? (
                <p className="text-gray-400">No recent submissions.</p>
              ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recent3.map((r) => (
        <div
          key={r._id}
          className="bg-black/30 p-4 rounded-lg border border-white/5 hover:border-purple-500/40 transition"
        >
       <video
  controls
  preload="metadata"
  className="w-full h-40 rounded"
>
  <source
    src={`http://localhost:5000/uploads/videos/${r.videoUrl}`}
    type="video/webm"
  />
  Your browser does not support the video tag.
</video>




          <p className="text-xs text-gray-400 mb-1">
            {new Date(r.createdAt).toLocaleString()}
          </p>

          <p className="text-sm mb-1">
            <strong>Prompt:</strong>{" "}
            <span className="text-purple-200">{r.prompt}</span>
          </p>

          <p className="text-sm">
            <strong>Status:</strong>{" "}
            <span className={
  r.reviewDecision === "approved"
    ? "text-green-400"
    : r.reviewDecision === "rejected"
    ? "text-red-400"
    : "text-yellow-400"
}>
  {r.reviewDecision || "pending"}
</span>
          </p>
        </div>
      ))}
                </div>
              )}
            </div>

            {/* Line Chart (span 2 columns on large) */}
            <div className="col-span-1 lg:col-span-2 bg-[#0D0D14] p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Activity (Malicious vs Not Malicious)</h2>
                <div className="text-sm text-gray-400">Last 7 days</div>
              </div>

              {/* We need a dual-line chart; if your LineChart supports two series, pass both arrays.
                  Otherwise, create a small inline Chart here. For now we will pass combined dataset:
              */}
              <DualLineChart data={lineChartDataSet} />
            </div>

            {/* Mailbox + Motivation */}
            <div className="col-span-1 lg:col-span-1 space-y-4 justify-center">
              <div className="bg-[#0D0D14] p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold mb-2">Quick Mail</h3>
                <div className="mb-2 text-sm text-gray-400">Send a short message to Admin or User</div>

                <select
                  className="w-full mb-2 p-2 rounded bg-black/40 border border-white/10"
                  value={mail.to}
                  onChange={(e) => setMail((m) => ({ ...m, to: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="both">Admin + User</option>
                </select>

                <input
                  className="w-full mb-2 p-2 rounded bg-black/40 border border-white/10"
                  placeholder="Subject"
                  value={mail.subject}
                  onChange={(e) => setMail((m) => ({ ...m, subject: e.target.value }))}
                />

                <textarea
                  className="w-full mb-2 p-2 rounded bg-black/40 border border-white/10"
                  rows={4}
                  placeholder="Message"
                  value={mail.body}
                  onChange={(e) => setMail((m) => ({ ...m, body: e.target.value }))}
                />

                <button
                  onClick={sendMail}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-md"
                >
                  {sendingMail ? "Sending..." : "Send"}
                </button>
              </div>

              <div className="bg-[#0D0D14] p-4 m-auto rounded-lg border border-white/10">
                <h3 className="font-semibold mb-2">Motivation</h3>
                <p className="text-sm text-gray-400 mb-3">Keep the momentum — your work matters for platform safety.</p>

                <div className="mb-2">
                  <div className="text-sm text-gray-300">Accuracy</div>
                  <div className="w-full bg-black/30 rounded h-3 mt-1">
                    <div className="h-3 bg-green-500 rounded" style={{ width: `${accuracy}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{accuracy}% recent accuracy</div>
                </div>

                <div>
                  <div className="text-sm text-gray-300">Streak</div>
                  <div className="text-lg font-semibold mt-1">🔥 4 days</div>
                  <div className="text-xs text-gray-400">Keep reviewing daily to increase your streak.</div>
                </div>
              </div>
            </div>
          </div>

          

        </main>
      </div>
    </div>
  );
}


