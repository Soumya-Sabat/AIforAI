import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ menu = [] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <aside className="w-64 min-h-screen bg-[#0B0B14] p-4">
      <h1 className="text-2xl font-semibold text-purple-400 mb-8">
        AI For AI
      </h1>

      <nav className="flex flex-col gap-1">
        {menu.map((item) => {
          const Icon = item.icon;
          if (item.action === "logout") {
            return (
              <button
                key="logout"
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 rounded-xl
                           text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <Icon size={20} />
                <span className="text-lg font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  active
                    ? "bg-[#8B2CF5] text-white"
                    : "text-gray-300 hover:bg-white/5"
                }
              `}
            >
              {/* ICON */}
              <Icon
                size={20}
                className={active ? "text-white" : "text-gray-400"}
              />

              {/* TEXT */}
              <span className="text-lg font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
