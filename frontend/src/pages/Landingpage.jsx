import { FaRobot, FaUpload, FaGift, FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A14] text-white font-sans">
      
      <header className="w-full px-8 py-4 flex items-center justify-between backdrop-blur bg-[#0a0a14]/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <a className="text-2xl font-semibold" href="#home">AI for AI</a>
        </div>

        <nav className="hidden md:flex items-center gap-10 text-lg text-gray-300" >
          <a href="#home" className="relative inline-block hover:text-white duration-200 text-xl
           after:content-[''] after:absolute after:left-0 after:bottom-0
           after:h-\[2px] after:w-0 after:bg-purple-500 after:transition-all after:duration-300
           hover:after:w-full">Home</a>

          <a href="#features" className="relative inline-block hover:text-white duration-200 text-xl
           after:content-[''] after:absolute after:left-0 after:bottom-0
           after:h-\[2px] after:w-0 after:bg-purple-500 after:transition-all after:duration-300
           hover:after:w-full">About</a>
          <a href="#how" className="relative inline-block hover:text-white duration-200 text-xl
           after:content-[''] after:absolute after:left-0 after:bottom-0
           after\:h-[2px\] after:w-0 after:bg-purple-500 after:transition-all after:duration-300
           hover:after:w-full">How It Works</a>
        </nav>

        <div className="flex items-center gap-6 text-lg">
      
        <Link to="/auth">
          <button className="bg-purple-600 px-4 py-2 rounded-md text-lg font-semibold hover:bg-purple-700 duration-200" >
            login
          </button>
        </Link>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="w-full px-8 md:px-20 py-24 flex flex-col md:flex-row items-center justify-between" id="home">
        
        {/* Left content */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-purple-700">
            Detect Malicious AI Outputs with AI
          </h1>

          <p className="mt-6 text-gray-300 text-lg leading-relaxed">
            Report harmful or unsafe responses from any AI model and earn rewards for contributing.
          </p>

          <div className="flex gap-4 mt-8">
            <button className="bg-purple-600 px-6 py-3 rounded-md font-semibold hover:bg-purple-700 duration-200">
              Get Started
            </button>

            <button className="border border-purple-500 px-6 py-3 rounded-md font-semibold text-purple-400 hover:bg-purple-500 hover:text-white duration-200">
              Try Our Chatbot
            </button>
          </div>
        </div>

        {/* Right illustration placeholder */}
        <div className="w-[380px] h-[350px] mt-10 md:mt-0 border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-600 text-5xl">
          &lt;
        </div>

      </section>

      {/* ---------------- FEATURES SECTION ---------------- */}
      <section className="px-8 md:px-20 py-20 text-center" id="features">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <p className="text-gray-400 mt-2">
          Our platform provides multiple ways to contribute to a safer AI ecosystem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">

          {/* Feature Card 1 */}
          <div className="p-6 rounded-xl border border-purple-900 bg-white/5 hover:bg-white/10 duration-200">
            <FaRobot className="text-purple-400 text-3xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Use Our Chatbot</h3>
            <p className="text-gray-400">Instantly check AI responses for malicious content using our dedicated chatbot.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="p-6 rounded-xl border border-purple-900 bg-white/5 hover:bg-white/10 duration-200">
            <FaUpload className="text-purple-400 text-3xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Upload Screen Recording</h3>
            <p className="text-gray-400">Easily upload screen recordings of harmful outputs from any AI model.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="p-6 rounded-xl border border-purple-900 bg-white/5 hover:bg-white/10 duration-200">
            <FaGift className="text-purple-400 text-3xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-400">Get rewarded for each valid and verified malicious report you submit.</p>
          </div>

        </div>
      </section>

      {/* ---------------- HOW IT WORKS SECTION ---------------- */}
      <section className="px-8 md:px-20 py-20" id="how">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>

        <div className="mt-16 max-w-lg mx-auto space-y-16 text-c">

          {/* Step Item */}
          {[
            { title: "Use Any AI", desc: "Interact with any AI model, inside or outside our platform." },
            { title: "Record Malicious Output", desc: "Capture the harmful or unsafe response via screen recording." },
            { title: "Upload to Our Portal", desc: "Submit your recording through our secure and easy-to-use system." },
            { title: "Verification", desc: "Our system, peer reviewers, and admins will verify the submission." },
            { title: "Earn Reward", desc: "Receive rewards for each valid and verified report." }
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <div className="relative w-10 h-10 flex items-center justify-center mt-0 neon-rotate">

  {/* Expanding Ripple Wave */}
  <div className="absolute w-8 h-8 rounded-full border border-purple-400/40 ripple"></div>

  {/* Outer glowing aura */}
  <div className="absolute w-8 h-8 rounded-full bg-purple-500/40 outer-pulse blur-lg"></div>

  {/* Middle pulse circle */}
  <div className="absolute w-5 h-5 rounded-full bg-purple-500/70 mid-pulse blur-sm"></div>

  {/* Inner small core */}
  <div className="w-3 h-3 rounded-full bg-purple-300"></div>
</div>

              </div>

              <div>
                <h3 className="text-xl font-semibold">Step {index + 1}</h3>
                <p className="text-purple-400 font-medium mt-1">{step.title}</p>
                <p className="text-gray-400 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-white/10 px-8 md:px-20 py-6 flex items-center justify-between text-gray-500 text-sm">
        <p>© 2025 AI for AI. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white duration-200">Terms</a>
          <a href="#" className="hover:text-white duration-200">Privacy</a>
          <a href="#" className="hover:text-white duration-200">Contact</a>
        </div>
      </footer>

    </div>
  );
}
