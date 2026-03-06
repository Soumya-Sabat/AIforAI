import { FaRobot, FaUpload, FaGift } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white font-sans">

      {/* ── HEADER ── */}
      <header className="w-full px-5 sm:px-8 py-4 flex items-center justify-between
                         backdrop-blur bg-[#0a0a14]/50 border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <a className="text-xl sm:text-2xl font-semibold" href="#home">AI for AI</a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 text-gray-300">
          {["#home", "#features", "#how"].map((href, i) => (
            <a key={href} href={href}
              className="relative inline-block hover:text-white duration-200 text-lg
                         after:content-[''] after:absolute after:left-0 after:bottom-0
                         after:h-0.5 after:w-0 after:bg-purple-500 after:transition-all after:duration-300
                         hover:after:w-full">
              {["Home", "About", "How It Works"][i]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <button className="bg-purple-600 px-4 py-2 rounded-md text-sm sm:text-base font-semibold hover:bg-purple-700 duration-200">
              Login
            </button>
          </Link>
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D0D18] border-b border-white/5 px-5 py-4 flex flex-col gap-3 text-gray-300">
          {[["#home","Home"],["#features","About"],["#how","How It Works"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              className="py-2 hover:text-purple-400 transition text-sm font-medium">
              {label}
            </a>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section className="w-full px-5 sm:px-8 md:px-20 py-16 sm:py-24
                          flex flex-col md:flex-row items-center justify-between gap-10" id="home">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight
                         text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-purple-700">
            Detect Malicious AI Outputs with AI
          </h1>
          <p className="mt-6 text-gray-300 text-base sm:text-lg leading-relaxed">
            Report harmful or unsafe responses from any AI model and earn rewards for contributing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start">
            <button className="bg-purple-600 px-6 py-3 rounded-md font-semibold hover:bg-purple-700 duration-200 w-full sm:w-auto">
              Get Started
            </button>
            <button className="border border-purple-500 px-6 py-3 rounded-md font-semibold
                               text-purple-400 hover:bg-purple-500 hover:text-white duration-200 w-full sm:w-auto">
              Try Our Chatbot
            </button>
          </div>
        </div>

        <div className="w-full sm:w-[380px] h-[220px] sm:h-[350px] border border-purple-500/40
                        rounded-xl flex items-center justify-center text-purple-600 text-5xl shrink-0">
          &lt;
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-5 sm:px-8 md:px-20 py-16 sm:py-20 text-center" id="features">
        <h2 className="text-2xl sm:text-3xl font-bold">Key Features</h2>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Our platform provides multiple ways to contribute to a safer AI ecosystem.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-10 sm:mt-14">
          {[
            { icon: FaRobot, title: "Use Our Chatbot", desc: "Instantly check AI responses for malicious content using our dedicated chatbot." },
            { icon: FaUpload, title: "Upload Screen Recording", desc: "Easily upload screen recordings of harmful outputs from any AI model." },
            { icon: FaGift, title: "Earn Rewards", desc: "Get rewarded for each valid and verified malicious report you submit." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 sm:p-6 rounded-xl border border-purple-900 bg-white/5 hover:bg-white/10 duration-200 text-left sm:text-center">
              <Icon className="text-purple-400 text-3xl mb-4 sm:mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 sm:px-8 md:px-20 py-16 sm:py-20" id="how">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">How It Works</h2>
        <div className="mt-12 sm:mt-16 max-w-lg mx-auto space-y-10 sm:space-y-16">
          {[
            { title: "Use Any AI", desc: "Interact with any AI model, inside or outside our platform." },
            { title: "Record Malicious Output", desc: "Capture the harmful or unsafe response via screen recording." },
            { title: "Upload to Our Portal", desc: "Submit your recording through our secure and easy-to-use system." },
            { title: "Verification", desc: "Our system, peer reviewers, and admins will verify the submission." },
            { title: "Earn Reward", desc: "Receive rewards for each valid and verified report." },
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-5 sm:gap-6">
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full border border-purple-400/40 animate-ping opacity-30" />
                  <div className="absolute w-8 h-8 rounded-full bg-purple-500/40 blur-lg" />
                  <div className="absolute w-5 h-5 rounded-full bg-purple-500/70 blur-sm" />
                  <div className="w-3 h-3 rounded-full bg-purple-300 relative z-10" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">Step {index + 1}</h3>
                <p className="text-purple-400 font-medium mt-1 text-sm sm:text-base">{step.title}</p>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-5 sm:px-8 md:px-20 py-6
                         flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-sm">
        <p>© 2025 AI for AI. All rights reserved.</p>
        <div className="flex gap-4 sm:gap-6">
          {["Terms","Privacy","Contact"].map(l => (
            <a key={l} href="#" className="hover:text-white duration-200">{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}