import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { FiGrid, FiFileText, FiUserCheck, FiEye, FiCheckCircle, FiUsers, FiShield, FiActivity, FiSettings } from "react-icons/fi";
export default function AdminTeam() {
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
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "peer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FETCH TEAM ================= */
  const fetchTeam = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load team");

      const data = await res.json();
      setTeam(data);
    } catch (err) {
      setError("Unable to fetch team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  /* ================= CREATE USER ================= */
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess(`${form.role} created successfully`);
      setForm({ name: "", email: "", password: "", role: "peer" });
      fetchTeam();
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  };

  /* ================= TOGGLE USER ================= */
  const toggleStatus = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/admin/toggle/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTeam();
    } catch {
      setError("Failed to update status");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar menu={menu} />

      <div className="flex-1">
        <Header />

        <div className="p-6 space-y-14 ">

       
<div className="bg-linear-to-br from-purple-900/30 to-black/40 border border-purple-700/30 backdrop-blur-md p-6 rounded-2xl max-w-xl shadow-xl mx-auto ">
  <h2 className="text-2xl font-bold mb-5 text-purple-300">
    Create Admin / Peer
  </h2>

  {error && (
    <div className="bg-red-900/30 border border-red-600 text-red-400 p-2 rounded mb-3">
      {error}
    </div>
  )}

  {success && (
    <div className="bg-green-900/30 border border-green-600 text-green-400 p-2 rounded mb-3">
      {success}
    </div>
  )}

  <form onSubmit={handleCreate} className="space-y-4">
    <input
      className="w-full px-4 py-2 bg-black/60 border border-purple-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      placeholder="Full Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      required
    />

    <input
      className="w-full px-4 py-2 bg-black/60 border border-purple-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      placeholder="Email Address"
      type="email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      required
    />

    <input
      className="w-full px-4 py-2 bg-black/60 border border-purple-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      placeholder="Password"
      type="password"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      required
    />

    <select
      className="w-full px-4 py-2 bg-black/60 border border-purple-600/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
      value={form.role}
      onChange={(e) => setForm({ ...form, role: e.target.value })}
    >
      <option value="peer">Peer</option>
      <option value="admin">Admin</option>
    </select>

    <button
      type="submit"
      className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all py-2 rounded-lg font-semibold tracking-wide"
    >
      Create User
    </button>
  </form>
</div>


          {/* ================= TEAM LIST ================= */}
          <div className="bg-white/5 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full text-left text-lg border-collapse">
                <thead>
                  <tr className="border-b border-white/20 bg-purple-950">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((user) => (
                    <tr key={user._id} className="border-b border-white/10">
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="capitalize">{user.role}</td>
                      <td>{user.isActive ? "Active" : "Inactive"}</td>
                      <td>
                        <button
                          onClick={() => toggleStatus(user._id)}
                          className="text-sm bg-red-700 px-3 py-1 rounded"
                        >
                          Toggle
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
