import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FiGrid, FiFileText, FiEye, FiUsers, FiShield, FiActivity, FiSettings, FiMenu, FiLogOut } from "react-icons/fi";

const menu = [
  { label: "Dashboard",path: "/admin/dashboard",icon: FiGrid },
  { label: "Submissions",path: "/admin/submissions", icon: FiFileText },
  { label: "Review Monitoring", path: "/admin/reviews", icon: FiEye },
  { label: "Users", path: "/admin/manageteam",icon: FiUsers },
  { label: "AI Governance", path: "/admin/ai-governance",icon: FiShield },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FiActivity },
  { label: "Settings", path: "/admin/settings", icon: FiSettings },
  { label: "Logout", action: "logout",icon: FiLogOut },
];

export default function AdminAssignReviews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [peers, setPeers] = useState([]);
  const [selectedPeers, setSelectedPeers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [rR, pR] = await Promise.all([
        fetch("http://localhost:5000/api/reports/all",  { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/admin/team",   { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!rR.ok) throw new Error("Failed to fetch reports");
      if (!pR.ok) throw new Error("Failed to fetch peers");
      const rData = await rR.json(), pData = await pR.json();
      setReports(rData);
      setPeers(pData.filter(u => u.role === "peer"));
    } catch (err) { setError(err.message || "Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const assignPeer = async (reportId) => {
    const peersForReport = selectedPeers[reportId];
    if (!peersForReport || peersForReport.length === 0) { setError("Please select at least one peer"); return; }
    try {
      const res = await fetch("http://localhost:5000/api/assignments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportId, peers: peersForReport, deadline: new Date(Date.now() + 7 * 86400000) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Review assigned successfully");
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (err) { setError(err.message || "Assignment failed"); }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
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

        <div className="p-4 sm:p-6 space-y-5 overflow-x-hidden">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-300">Assign Reviews to Peers</h1>

          {error   && <div className="bg-red-900/30 border border-red-600 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-900/30 border border-green-600 text-green-400 p-3 rounded-lg text-sm">{success}</div>}

          <div className="bg-white/5 border border-purple-700/30 rounded-xl overflow-hidden">
            {loading ? (
              <p className="p-4 text-sm text-gray-400">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No reports to assign.</p>
            ) : (
              <>
                {/* ── Desktop table (md+) ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-purple-950 text-xs uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Report ID</th>
                        <th className="px-4 py-3">Prompt</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assign Peers</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">{report.reportId}</td>
                          <td className="px-4 py-3 max-w-[200px] truncate">{report.prompt || "—"}</td>
                          <td className="px-4 py-3 capitalize text-yellow-400 text-xs">{report.finalStatus || "pending"}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {peers.map(peer => (
                                <label key={peer._id} className="flex items-center gap-2 text-xs cursor-pointer">
                                  <input type="checkbox" value={peer._id}
                                    checked={(selectedPeers[report._id] || []).includes(peer._id)}
                                    onChange={(e) => setSelectedPeers(prev => {
                                      const cur = prev[report._id] || [];
                                      return { ...prev, [report._id]: e.target.checked ? [...cur, peer._id] : cur.filter(id => id !== peer._id) };
                                    })}
                                    className="accent-purple-500"
                                  />
                                  {peer.name}
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => assignPeer(report._id)}
                              className="bg-purple-600 hover:bg-purple-700 transition px-3 py-1.5 rounded-lg text-xs font-medium">
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ── */}
                <div className="md:hidden divide-y divide-white/10">
                  {reports.map((report) => (
                    <div key={report._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-gray-500">{report.reportId}</p>
                          <p className="text-sm font-medium mt-0.5 truncate">{report.prompt || "—"}</p>
                        </div>
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full shrink-0 capitalize">
                          {report.finalStatus || "pending"}
                        </span>
                      </div>

                      {/* Peer checkboxes */}
                      {peers.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Select peers:</p>
                          <div className="flex flex-wrap gap-2">
                            {peers.map(peer => (
                              <label key={peer._id}
                                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition
                                  ${(selectedPeers[report._id] || []).includes(peer._id)
                                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                                    : "bg-white/5 border-white/10 text-gray-400"}`}>
                                <input type="checkbox" value={peer._id} className="hidden"
                                  checked={(selectedPeers[report._id] || []).includes(peer._id)}
                                  onChange={(e) => setSelectedPeers(prev => {
                                    const cur = prev[report._id] || [];
                                    return { ...prev, [report._id]: e.target.checked ? [...cur, peer._id] : cur.filter(id => id !== peer._id) };
                                  })}
                                />
                                {peer.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <button onClick={() => assignPeer(report._id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 transition
                                   py-2 rounded-lg text-sm font-medium">
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}