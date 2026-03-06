import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ menu = [], open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");   
  localStorage.removeItem("user");   
  window.location.href = "/auth";    
};

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30
          bg-[#0B0B14] p-4 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-purple-400">
            AI For AI
          </h1>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition"
          >
            {/* X icon via SVG to avoid extra dep */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;

            if (item.action === "logout") {
              return (
                <button
                  key="logout"
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl
                             text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-2"
                >
                  <Icon size={20} />
                  <span className="text-lg font-medium">{item.label}</span>
                </button>
              );
            }

            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}   /* close drawer on nav */
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${active ? "bg-[#8B2CF5] text-white" : "text-gray-300 hover:bg-white/5"}
                `}
              >
                <Icon size={20} className={active ? "text-white" : "text-gray-400"} />
                <span className="text-lg font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
