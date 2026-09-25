import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, Home, Leaf, LogOut, PlusCircle, Settings, Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Pulpit", icon: Home },
  { to: "/garden", label: "Ogród", icon: Leaf },
  { to: "/schedules", label: "Harmonogramy", icon: CalendarDays },
  { to: "/catalog", label: "Katalog", icon: BookOpen },
  { to: "/microclimates", label: "Mikroklimaty", icon: Settings },
];

const titles = {
  "/": "Pulpit główny",
  "/garden": "Wirtualny ogród",
  "/schedules": "Harmonogramy pielęgnacji",
  "/catalog": "Katalog roślin",
  "/microclimates": "Mikroklimaty",
  "/plants/add": "Dodawanie rośliny",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = titles[location.pathname] || "Greenly";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Sprout size={24} /></div>
          <div>
            <strong>Greenly</strong>
            <span>Virtual garden</span>
          </div>
        </div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} /> Wyloguj
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Greenly</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="user-chip">{user?.email}</span>
            <button className="primary compact" onClick={() => navigate("/plants/add")}>
              <PlusCircle size={18} /> Dodaj roślinę
            </button>
          </div>
        </header>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
