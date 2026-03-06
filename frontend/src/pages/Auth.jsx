import React, { useState } from "react";
import aiImg from "../assets/ai_governance.png";
import { Link } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      if (data.user.role === "admin") window.location.href = "/admin/dashboard";
      else if (data.user.role === "peer") window.location.href = "/reviewer/dashboard";
      else window.location.href = "/user/dashboard";
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsLogin(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full px-4 py-2.5 rounded-lg bg-white/10 border border-purple-500/20
    text-white placeholder-purple-300/60 focus:outline-none focus:ring-2
    focus:ring-purple-500/50 transition text-sm`;


  const selectCls = `w-full px-4 py-2.5 rounded-lg border border-purple-500/20 bg-white/10
    text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50
    transition text-sm bg-[#1f2937]`;

 
  const RoleSelect = ({ name }) => (
    <select className={selectCls} name={name} onChange={handleChange}>
      <option value="user"  className="bg-[#1f2937] text-white">User</option>
      <option value="peer"  className="bg-[#1f2937] text-white">Peer Reviewer</option>
      <option value="admin" className="bg-[#1f2937] text-white">Admin</option>
    </select>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 py-8 overflow-hidden">

      {/* ── Card ── */}
      <div className="relative w-full max-w-[900px] bg-white/7 backdrop-blur-xl
                      border border-purple-500/30 rounded-2xl
                      shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden">

        {/* ── DESKTOP layout ── */}
        <div className="hidden md:flex h-[550px]">

          {/* Image panel */}
          <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out
                           ${isLogin ? "translate-x-full" : "translate-x-0"}`}>
            <img src={aiImg} className="w-full h-full object-cover opacity-80" alt="auth" />
          </div>

          {/* Login form */}
          <div className={`absolute top-0 left-0 h-full w-1/2 p-10 flex flex-col justify-center
                           transition-all duration-700 ease-in-out space-y-4
                           ${isLogin ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"}`}>
            <h2 className="text-3xl text-purple-400 font-semibold mb-2">Welcome Back</h2>
            {error && isLogin && <p className="text-red-400 text-sm">{error}</p>}
            <input className={inputCls} name="email" onChange={handleChange} placeholder="Email" />
            <input type="password" className={inputCls} name="password" onChange={handleChange} placeholder="Password" />
            <RoleSelect name="role" />
            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg
                         transition font-semibold shadow-lg disabled:opacity-50 text-sm">
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-white text-sm text-center">
              Don't have an account?{" "}
              <button className="text-purple-400 underline" onClick={() => setIsLogin(false)}>Sign Up</button>
            </p>
          </div>

          {/* Signup form */}
          <div className={`absolute top-0 right-0 h-full w-1/2 p-10 flex flex-col justify-center
                           transition-all duration-700 ease-in-out space-y-4
                           ${isLogin ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100 pointer-events-auto"}`}>
            <h2 className="text-3xl text-purple-300 font-semibold mb-2">Create Account</h2>
            {error && !isLogin && <p className="text-red-400 text-sm">{error}</p>}
            <input className={inputCls} name="name" onChange={handleChange} placeholder="Full Name" />
            <input className={inputCls} name="email" onChange={handleChange} placeholder="Email" />
            <input type="password" className={inputCls} name="password" onChange={handleChange} placeholder="Password" />
            <button onClick={handleSignup} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg
                         transition font-semibold shadow-lg disabled:opacity-50 text-sm">
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <p className="text-white text-sm text-center">
              Already have an account?{" "}
              <button className="text-purple-400 underline" onClick={() => setIsLogin(true)}>Login</button>
            </p>
          </div>
        </div>

        {/* ── MOBILE layout ── */}
        <div className="md:hidden p-6 space-y-5">
          <div className="flex rounded-lg bg-white/5 border border-white/10 p-1">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition
                ${isLogin ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
              Login
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition
                ${!isLogin ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>
              Sign Up
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {isLogin ? (
            <div className="space-y-3">
              <h2 className="text-2xl text-purple-400 font-semibold">Welcome Back</h2>
              <input className={inputCls} name="email" onChange={handleChange} placeholder="Email" />
              <input type="password" className={inputCls} name="password" onChange={handleChange} placeholder="Password" />
              <RoleSelect name="role" />
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg
                           transition font-semibold disabled:opacity-50 text-sm">
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-2xl text-purple-300 font-semibold">Create Account</h2>
              <input className={inputCls} name="name" onChange={handleChange} placeholder="Full Name" />
              <input className={inputCls} name="email" onChange={handleChange} placeholder="Email" />
              <input type="password" className={inputCls} name="password" onChange={handleChange} placeholder="Password" />
              <button onClick={handleSignup} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg
                           transition font-semibold disabled:opacity-50 text-sm">
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}