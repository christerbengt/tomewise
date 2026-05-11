import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout, isAdmin } = useAuth();
  const location = useLocation();
  const { i18n, t } = useTranslation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "sv" : "en");
  };

  const navLinks = [
    {
      path: "/dashboard",
      label: t("dashboard"),
      mobileOnly: true,
      isHome: true,
    },
    { path: "/my-books", label: t("myBooks"), mobileOnly: true, isHome: false },
    {
      path: "/locations",
      label: t("locations"),
      mobileOnly: true,
      isHome: false,
    },
    { path: "/lending", label: t("lending"), mobileOnly: true, isHome: false },
    {
      path: "/listings",
      label: t("listings"),
      mobileOnly: false,
      isHome: false,
    },
  ];

  return (
    <div className="layout">
      <div className="mobile-header">
        <span className="mobile-header-title">Tomewise</span>
        <div className="mobile-header-actions">
          {isAdmin && (
            <div className="admin-menu">
              <button
                className="mobile-icon-button"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
              >
                ⚙
              </button>
              {showAdminMenu && (
                <div className="admin-dropdown">
                  <Link
                    to="/admin/users"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/invites"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    Invites
                  </Link>
                </div>
              )}
            </div>
          )}
          <Link to="/profile" className="mobile-icon-button">
            👤
          </Link>
        </div>
      </div>

      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Tomewise</h1>
          <span className="sidebar-tagline">Books in Order</span>
        </div>

        <ul className="nav-links">
          {navLinks.map((link, index) => (
            <>
              {(index === 2 || index === 3) && (
                <li
                  key={`divider-${index}`}
                  className="nav-divider"
                  aria-hidden="true"
                />
              )}
              <li
                key={link.path}
                className={!link.mobileOnly ? "desktop-only" : ""}
              >
                <Link
                  to={link.path}
                  className={location.pathname === link.path ? "active" : ""}
                >
                  {link.isHome ? (
                    <>
                      <span className="nav-icon">⌂</span>
                      <span className="nav-label">{link.label}</span>
                    </>
                  ) : (
                    <span className="nav-label">{link.label}</span>
                  )}
                </Link>
              </li>
            </>
          ))}
        </ul>

        <Link
          to="/profile"
          className={`profile-link desktop-only ${location.pathname === "/profile" ? "active" : ""}`}
        >
          {t("profile")}
        </Link>

        {isAdmin && (
          <>
            <div className="nav-section-divider desktop-only" />
            <Link
              to="/admin/users"
              className={`profile-link desktop-only ${location.pathname === "/admin/users" ? "active" : ""}`}
            >
              Admin: Users
            </Link>
            <Link
              to="/admin/invites"
              className={`profile-link desktop-only ${location.pathname === "/admin/invites" ? "active" : ""}`}
            >
              Admin: Invites
            </Link>
          </>
        )}

        <a
          href="https://ko-fi.com/christerbengt"
          target="_blank"
          rel="noreferrer"
          className="kofi-link"
        >
          ☕ Donate
        </a>

        <button className="language-button" onClick={toggleLanguage}>
          {i18n.language === "en" ? "Svenska" : "English"}
        </button>
        
        <button className="logout-button" onClick={logout}>
          <span className="nav-icon">⏻</span>
          <span className="nav-label">{t("signOut")}</span>
        </button>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
