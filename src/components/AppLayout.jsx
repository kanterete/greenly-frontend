import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, Home, Leaf, LogOut, Plus, Settings, Sprout, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Pulpit", short: "Pulpit", icon: Home },
  { to: "/garden", label: "Ogród", short: "Ogród", icon: Leaf },
  { to: "/schedules", label: "Harmonogramy", short: "Plan", icon: CalendarDays },
  { to: "/catalog", label: "Katalog", short: "Katalog", icon: BookOpen },
  { to: "/microclimates", label: "Mikroklimaty", short: "Strefy", icon: Settings },
  { to: "/profile", label: "Profil", short: "Profil", icon: User },
];

const titles = {
  "/": "Pulpit",
  "/garden": "Wirtualny ogród",
  "/schedules": "Harmonogramy",
  "/catalog": "Katalog roślin",
  "/microclimates": "Mikroklimaty",
  "/microclimates/add": "Nowy mikroklimat",
  "/plants/add": "Nowa roślina",
  "/profile": "Profil",
};

const resolveTitle = (pathname) => {
  if (titles[pathname]) return titles[pathname];
  if (/^\/plants\/\d+\/edit$/.test(pathname)) return "Edycja rośliny";
  if (/^\/plants\/\d+$/.test(pathname)) return "Szczegóły rośliny";
  if (/^\/microclimates\/\d+\/edit$/.test(pathname)) return "Edycja mikroklimatu";
  if (pathname.startsWith("/catalog/")) return "Katalog roślin";
  return "Greenly";
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Sprout size={18} /></div>
          <strong>Greenly</strong>
        </div>
        <nav className="side-nav" aria-label="Nawigacja główna">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-user" title={user?.email}>
            <span className="avatar-initial">{user?.email?.[0]?.toUpperCase() || "?"}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </NavLink>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} /> Wyloguj
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <div className="mobile-brand" aria-hidden="true">
              <div className="brand-icon"><Sprout size={16} /></div>
            </div>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <button className="primary compact" onClick={() => navigate("/plants/add")} aria-label="Dodaj roślinę">
              <Plus size={18} /> <span className="btn-label">Dodaj roślinę</span>
            </button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Nawigacja mobilna">
        {links.map(({ to, short, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={20} strokeWidth={1.8} />
            <span>{short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
