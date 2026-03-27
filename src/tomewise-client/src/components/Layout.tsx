import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinks = [
  { path: '/', label: 'Dashboard', mobileOnly: true },
  { path: '/my-books', label: 'My Books', mobileOnly: true },
  { path: '/locations', label: 'Locations', mobileOnly: true },
  { path: '/lending', label: 'Lending', mobileOnly: true },
  { path: '/listings', label: 'Listings', mobileOnly: false },
];

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Tomewise</h1>
        </div>
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li
              key={link.path}
              className={!link.mobileOnly ? "desktop-only" : ""}
            >
              <Link
                to={link.path}
                className={location.pathname === link.path ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
