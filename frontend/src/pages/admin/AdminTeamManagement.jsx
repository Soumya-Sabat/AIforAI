import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FiGrid, FiFileText, FiEye, FiUsers, FiShield, FiActivity, FiSettings, FiMenu, FiLogOut } from "react-icons/fi";

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

const inputCls = "w-full px-4 py-2.5 bg-black/60 border border-purple-600/40 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition";

export default function AdminTeam() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [team, setTeam]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState({ name: "", email: "", password: "", role: "peer" });
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  const token = localStorage.getItem("token");

  const fetchTeam = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load team");
      setTeam(await res.json());
    } catch { setError("Unable to fetch team"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(`${form.role} created successfully`);
      setForm({ name: "", email: "", password: "", role: "peer" });
      fetchTeam();
    } catch (err) { setError(err.message || "Failed to create user"); }
  };

  const toggleStatus = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/toggle/${id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeam();
    } catch { setError("Failed to update status"); }
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

        <div className="p-4 sm:p-6 space-y-8 overflow-x-hidden">

          {/* Create user form */}
          <div className="bg-linear-to-br from-purple-900/30 to-black/40 border border-purple-700/30
                          backdrop-blur-md p-5 sm:p-6 rounded-2xl w-full max-w-xl mx-auto shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-5 text-purple-300">Create Admin / Peer</h2>

            {error   && <div className="bg-red-900/30 border border-red-600 text-red-400 p-2.5 rounded-lg mb-3 text-sm">{error}</div>}
            {success && <div className="bg-green-900/30 border border-green-600 text-green-400 p-2.5 rounded-lg mb-3 text-sm">{success}</div>}

            <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
              <input className={inputCls} placeholder="Full Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={inputCls} placeholder="Email Address" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className={inputCls} placeholder="Password" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <select className={inputCls + " bg-black/60"} value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="peer">Peer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit"
                className="w-full bg-linear-to-r from-purple-600 to-indigo-600
                           hover:from-purple-700 hover:to-indigo-700 transition-all
                           py-2.5 rounded-lg font-semibold tracking-wide text-sm">
                Create User
              </button>
            </form>
          </div>

          {/* Team list */}
          <div className="bg-white/5 p-4 sm:p-6 rounded-xl">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Team Members</h2>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : team.length === 0 ? (
              <p className="text-gray-400 text-sm">No team members yet.</p>
            ) : (
              <>
                {/* ── Desktop table ── */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/20 bg-purple-950 text-xs uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((user) => (
                        <tr key={user._id} className="border-b border-white/10 hover:bg-white/3 transition">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-gray-400">{user.email}</td>
                          <td className="px-4 py-3 capitalize">{user.role}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                              ${user.isActive
                                ? "bg-green-500/15 text-green-400 border border-green-500/20"
                                : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleStatus(user._id)}
                              className="text-xs bg-red-700 hover:bg-red-600 transition px-3 py-1.5 rounded-lg">
                              Toggle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile cards ── */}
                <div className="sm:hidden space-y-3">
                  {team.map((user) => (
                    <div key={user._id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                          ${user.isActive
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs capitalize text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                          {user.role}
                        </span>
                        <button onClick={() => toggleStatus(user._id)}
                          className="text-xs bg-red-700 hover:bg-red-600 transition px-3 py-1.5 rounded-lg">
                          Toggle
                        </button>
                      </div>
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