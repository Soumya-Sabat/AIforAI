import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  FiGrid,
  FiFileText,
  FiUserCheck,
  FiEye,
  FiCheckCircle,
  FiUsers,
  FiShield,
  FiActivity,
  FiSettings
} from "react-icons/fi";

export default function AdminAssignReviews() {
  const menu = [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Submissions", path: "/admin/submissions", icon: FiFileText },
    // { label: "Assign Reviews", path: "/admin/assign-reviews", icon: FiUserCheck },
    { label: "Review Monitoring", path: "/admin/reviews", icon: FiEye },  //admin reviews
    // { label: "Final Decisions", path: "/admin/decisions", icon: FiCheckCircle },
    { label: "Users", path: "/admin/manageteam", icon: FiUsers },
    { label: "AI Governance", path: "/admin/ai-governance", icon: FiShield },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: FiActivity },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
     { label: "Logout", action: "logout", icon: FiSettings },
  ];

  const token = localStorage.getItem("token");

  const [reports, setReports] = useState([]);
  const [peers, setPeers] = useState([]);
  const [selectedPeers, setSelectedPeers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const [reportsRes, peersRes] = await Promise.all([
        fetch("http://localhost:5000/api/reports/all", {   // fixed URL
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/team", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (!reportsRes.ok) throw new Error("Failed to fetch reports");
      if (!peersRes.ok) throw new Error("Failed to fetch peers");

      const reportsData = await reportsRes.json();
      const peersData = await peersRes.json();

      setReports(reportsData);
      setPeers(peersData.filter(u => u.role === "peer"));
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= ASSIGN REVIEW ================= */
  const assignPeer = async (reportId) => {
  const peersForReport = selectedPeers[reportId];

  if (!peersForReport || peersForReport.length === 0) {
    setError("Please select at least one peer");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/assignments/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reportId,
        peers: peersForReport,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setSuccess("Review assigned successfully");

    // 🔥 REMOVE REPORT FROM UI AFTER ASSIGN
    setReports(prev => prev.filter(r => r._id !== reportId));
  } catch (err) {
    setError(err.message || "Assignment failed");
  }
};


     

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar menu={menu} />
      <div className="flex-1">
        <Header />
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-purple-300">
            Assign Reviews to Peers
          </h1>

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 p-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/30 border border-green-600 text-green-400 p-3 rounded">
              {success}
            </div>
          )}

          <div className="bg-white/5 border border-purple-700/30 rounded-xl overflow-hidden">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-purple-950">
                  <tr>
                    <th className="p-3">Report ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assign Peer</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">{report.reportId}</td>
                      <td className="p-3">{report.prompt || "—"}</td>
                      <td className="p-3 capitalize">{report.finalStatus || "pending"}</td>
                      <td className="p-3">
                        {peers.map(peer => (
  <label key={peer._id} className="flex items-center gap-2">
    <input
      type="checkbox"
      value={peer._id}
      checked={(selectedPeers[report._id] || []).includes(peer._id)}
      onChange={(e) => {
        setSelectedPeers(prev => {
          const current = prev[report._id] || [];
          return {
            ...prev,
            [report._id]: e.target.checked
              ? [...current, peer._id]
              : current.filter(id => id !== peer._id)
          };
        });
      }}
    />
    {peer.name}
  </label>
))}

                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => assignPeer(report._id)}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
