import React, { useState } from "react";
import aiImg from "../assets/ai_governance.png";
import { Link } from "react-router-dom";
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
const handleLogin = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // store token
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    // ROLE BASED REDIRECT
    if (data.user.role === "admin") window.location.href = "/admin/dashboard";
    else if (data.user.role === "peer") window.location.href = "/reviewer/dashboard";
    else window.location.href = "/user/dashboard";

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
const handleSignup = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setIsLogin(true); // move to login
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden " >

      <div className="relative w-[900px] h-[550px] bg-white/7 backdrop-blur-xl 
                      border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.4)]
                      overflow-hidden" >

        {/* ================= IMAGE SIDE ================= */}
        <div
          className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out
                      ${isLogin ? "translate-x-full" : "translate-x-0"}`}
        >
          <img
            src={aiImg}
            className="w-full h-full object-cover opacity-80"
            alt="auth"
          />
        </div>

      
       

        {/* login part */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 p-10 flex flex-col justify-center
                      transition-opacity duration-700 ease-in-out space-y-4
                      ${isLogin ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
        >
          <h2 className="text-3xl text-purple-400 font-semibold mb-4">Welcome Back</h2>

          <input
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-purple-500/20 
                       text-purple-100 placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            name="email"
            onChange={handleChange}
            placeholder="enter your email"
          />

          <input
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-purple-500/20 
                       text-white placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            placeholder="Enter your password"
            name="password"
            onChange={handleChange}
          />
          {/*role dropdown*/}
          <select
            className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-purple-500/20 
                       text-white placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            name="role"
            onChange={handleChange}
          >
            <option className="bg-gray-500" value="user">User</option>
            <option value="peer">Peer Reviewer</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white 
                       py-2 rounded-lg transition font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>


          <p className="text-white mt-2 text-lg text-center">
            Don't have an account?{" "}
            <button
              className="text-purple-400 underline"
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </p>
        </div>
         <div
          className={`absolute top-0 right-0 h-full w-1/2 p-10 flex flex-col justify-center
                      transition-opacity duration-700 ease-in-out space-y-4
                      ${isLogin ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}
        >
          <h2 className="text-3xl text-purple-300 font-semibold mb-4">Create Account</h2>

          <input
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-purple-500/20 
                       text-white placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            name="name"
            onChange={handleChange}
            placeholder="Full Name"
          />

          <input
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-purple-500/20 
                       text-white placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            name="email"
            onChange={handleChange}
            placeholder="Email"
          />

          <input
           
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-purple-500/20 
                       text-white placeholder-purple-300 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 transition"
            name="password"
            type="password"
            onChange={handleChange}
            placeholder="Password"
          />

           <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white 
                       py-2 rounded-lg transition font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-white mt-2 text-lg text-center">
            Already have an account?{" "}
            <button
              className="text-purple-400 underline"
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
