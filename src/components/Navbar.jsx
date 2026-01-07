import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;

  const displayName = useMemo(() => {
    return user?.email ? user.email.split("@")[0] : "Account";
  }, [user?.email]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Scroll background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent background scroll when menu open (mobile)
  useEffect(() => {
    if (menuOpen && window.innerWidth < 992) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        .cinema-navbar{
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          background: ${scrolled ? "rgba(10, 15, 30, 0.98)" : "rgba(10, 15, 30, 0.95)"};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.10);
          padding: 10px 0;
          transition: all .25s ease;
          box-shadow: ${scrolled ? "0 6px 22px rgba(0,0,0,0.25)" : "none"};
          min-height: 60px;
        }

        body { padding-top: 60px; }
        @media (min-width: 992px){
          .cinema-navbar{ min-height: 52px; padding: 8px 0; }
          body { padding-top: 52px; }
        }

        .navbar-container{
          width:100%;
          max-width:1200px;
          margin:0 auto;
          padding:0 18px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 14px;
          position: relative;
        }

        .navbar-brand{
          display:flex;
          align-items:center;
          gap:10px;
          text-decoration:none;
          color:white;
          font-size:1.25rem;
          font-weight:900;
          white-space:nowrap;
          padding: 6px 0;
        }

        .brand-icon{
          font-size:1.55rem;
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          line-height:1;
        }

        .brand-text{
          background: linear-gradient(90deg, #fff, #A78BFA);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          line-height:1;
        }

        /* ✅ Clean toggler */
        .navbar-toggler{
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.06);
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.18);
        }
        .navbar-toggler:focus{
          outline:none;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.28);
        }

        .toggle-icon{
          width: 22px;
          height: 16px;
          position: relative;
          display:block;
        }
        .toggle-icon span{
          position:absolute;
          left:0;
          width:100%;
          height:2px;
          background:#fff;
          border-radius: 2px;
          transition: transform .25s ease, top .25s ease, opacity .2s ease;
        }
        .toggle-icon span:nth-child(1){ top:0; }
        .toggle-icon span:nth-child(2){ top:7px; }
        .toggle-icon span:nth-child(3){ top:14px; }

        .navbar-toggler.is-open .toggle-icon span:nth-child(1){
          top:7px; transform: rotate(45deg);
        }
        .navbar-toggler.is-open .toggle-icon span:nth-child(2){
          opacity:0;
        }
        .navbar-toggler.is-open .toggle-icon span:nth-child(3){
          top:7px; transform: rotate(-45deg);
        }

        /* Links */
        .nav-link{
          color: rgba(255,255,255,0.75) !important;
          font-weight:800;
          font-size:14px;
          padding:10px 14px !important;
          border-radius:10px;
          transition: all .2s ease;
          display:flex;
          align-items:center;
          gap:8px;
          text-decoration:none;
        }
        .nav-link:hover{
          color:#fff !important;
          background: rgba(255,255,255,0.06);
        }
        .nav-link.active{
          color:#fff !important;
          background: linear-gradient(135deg, rgba(139,92,246,0.18), rgba(59,130,246,0.16));
          border: 1px solid rgba(139,92,246,0.26);
        }

        .user-section{
          display:flex;
          flex-direction:column;
          gap:10px;
          margin-top:12px;
          padding-top:12px;
          border-top:1px solid rgba(255,255,255,0.10);
        }

        .user-chip{
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 12px;
          background: rgba(255,255,255,0.06);
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.10);
          color:#fff;
          text-decoration:none;
          transition: all .2s ease;
        }
        .user-chip:hover{
          background: rgba(255,255,255,0.09);
          border-color: rgba(139,92,246,0.30);
        }

        .user-avatar{
          width:32px; height:32px;
          border-radius:50%;
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:900;
          font-size:12px;
          flex-shrink:0;
        }

        .user-info{ flex:1; min-width:0; }
        .user-name{
          font-size:12px;
          font-weight:900;
          margin-bottom:2px;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .user-email{
          font-size:10px;
          color: rgba(255,255,255,0.60);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }

        .user-role{
          background: linear-gradient(135deg, #F59E0B, #D97706);
          padding:2px 8px;
          border-radius:999px;
          font-size:9px;
          font-weight:900;
          white-space:nowrap;
        }

        .auth-buttons{
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .btn-auth{
          padding:10px 14px;
          border-radius:10px;
          font-weight:900;
          font-size:13px;
          text-decoration:none;
          transition: all .2s ease;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          border:none;
          cursor:pointer;
        }
        .btn-signin{
          background: transparent;
          color:#fff;
          border: 1.5px solid rgba(255,255,255,0.22);
        }
        .btn-signin:hover{ background: rgba(255,255,255,0.06); }
        .btn-signup{
          background: linear-gradient(135deg, #8B5CF6, #3B82F6);
          color:#fff;
          box-shadow: 0 10px 26px rgba(139,92,246,0.22);
        }
        .btn-signup:hover{ transform: translateY(-1px); }
        .btn-logout{
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color:#fff;
          box-shadow: 0 10px 26px rgba(239,68,68,0.20);
        }
        .btn-logout:hover{ transform: translateY(-1px); }
        .btn-admin{
          background: transparent;
          color:#F59E0B;
          border: 1.5px solid rgba(245,158,11,0.32);
        }
        .btn-admin:hover{ background: rgba(245,158,11,0.10); }

        /* ✅ MOBILE MENU PANEL (PURE REACT) */
        .mobile-menu-backdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity .2s ease;
        }
        .mobile-menu-backdrop.show{
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-menu{
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 15, 30, 0.98);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 34px rgba(0,0,0,0.35);
          padding: 14px 14px 18px;
          max-height: calc(100vh - 60px);
          overflow-y: auto;

          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;
          transition: transform .2s ease, opacity .2s ease;
        }
        .mobile-menu.show{
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-nav{
          display:flex;
          flex-direction:column;
          gap:6px;
          margin: 6px 0 0;
        }

        /* Desktop menu layout */
        .desktop-area{ display:none; }
        @media (min-width: 992px){
          .navbar-toggler{ display:none; }
          .desktop-area{
            display:flex;
            align-items:center;
            flex: 1;
            margin-left: 26px;
          }
          .desktop-nav{
            display:flex;
            gap:6px;
          }
          .user-section{
            flex-direction:row;
            align-items:center;
            margin-left:auto;
            padding:0;
            border:none;
          }
          .auth-buttons{ flex-direction:row; }
          .mobile-menu, .mobile-menu-backdrop{ display:none; }
        }
      `}</style>

      <nav className="cinema-navbar">
        <div className="navbar-container">
          <Link className="navbar-brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand-icon">🎬</span>
            <span className="brand-text">CineBook</span>
          </Link>

          {/* ✅ Mobile toggle */}
          <button
            className={`navbar-toggler ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((p) => !p)}
          >
            <span className="toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          {/* ✅ Desktop area */}
          <div className="desktop-area">
            <div className="desktop-nav">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
                <i className="fas fa-film"></i> <span>Movies</span>
              </NavLink>

              {isAuthed && (
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to="/my-bookings"
                >
                  <i className="fas fa-ticket-alt"></i> <span>My Bookings</span>
                </NavLink>
              )}
            </div>

            <div className="user-section">
              {!isAuthed ? (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-auth btn-signin">
                    <i className="fas fa-sign-in-alt"></i> <span>Sign in</span>
                  </Link>
                  <Link to="/signup" className="btn-auth btn-signup">
                    <i className="fas fa-user-plus"></i> <span>Create account</span>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/my-bookings" className="user-chip">
                    <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{displayName}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                    <div className="user-role">{user?.role === "admin" ? "ADMIN" : "USER"}</div>
                  </Link>

                  {user?.role === "admin" && (
                    <Link to="/admin" className="btn-auth btn-admin">
                      <i className="fas fa-shield-alt"></i> <span>Admin</span>
                    </Link>
                  )}

                  <button
                    className="btn-auth btn-logout"
                    onClick={() => {
                      logout();
                      navigate("/login", { replace: true });
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Backdrop */}
      <div
        className={`mobile-menu-backdrop ${menuOpen ? "show" : ""}`}
        onClick={closeMenu}
      />

      {/* ✅ Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <div className="mobile-nav">
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/"
            onClick={closeMenu}
          >
            <i className="fas fa-film"></i>
            <span>Movies</span>
          </NavLink>

          {isAuthed && (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              to="/my-bookings"
              onClick={closeMenu}
            >
              <i className="fas fa-ticket-alt"></i>
              <span>My Bookings</span>
            </NavLink>
          )}
        </div>

        <div className="user-section">
          {!isAuthed ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn-auth btn-signin" onClick={closeMenu}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign in</span>
              </Link>
              <Link to="/signup" className="btn-auth btn-signup" onClick={closeMenu}>
                <i className="fas fa-user-plus"></i>
                <span>Create account</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/my-bookings" className="user-chip" onClick={closeMenu}>
                <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <div className="user-name">{displayName}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
                <div className="user-role">{user?.role === "admin" ? "ADMIN" : "USER"}</div>
              </Link>

              {user?.role === "admin" && (
                <Link to="/admin" className="btn-auth btn-admin" onClick={closeMenu}>
                  <i className="fas fa-shield-alt"></i>
                  <span>Admin</span>
                </Link>
              )}

              <button
                className="btn-auth btn-logout"
                onClick={() => {
                  closeMenu();
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
