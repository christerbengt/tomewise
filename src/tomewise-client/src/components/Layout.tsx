import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "sv" : "en");
  };

  const navLinks = [
    { path: "/dashboard", label: t("dashboard"), mobileOnly: true },
    { path: "/my-books", label: t("myBooks"), mobileOnly: true },
    { path: "/locations", label: t("locations"), mobileOnly: true },
    { path: "/lending", label: t("lending"), mobileOnly: true },
    { path: "/listings", label: t("listings"), mobileOnly: false },
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
        <button className="language-button" onClick={toggleLanguage}>
          {i18n.language === "en" ? "Svenska" : "English"}
        </button>
        <button className="logout-button" onClick={logout}>
          {t("signOut")}
        </button>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
