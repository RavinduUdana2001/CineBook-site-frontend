import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import "./admin.css";

function getTitle(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/movies")) return "Movies";
  if (pathname.startsWith("/admin/halls")) return "Halls";
  if (pathname.startsWith("/admin/shows")) return "Shows";
  if (pathname.startsWith("/admin/bookings")) return "Bookings";
  return "Admin";
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();

  const pageTitle = useMemo(() => getTitle(location.pathname), [location.pathname]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);

  const getInst = () => {
    const el = canvasRef.current;
    if (!el) return null;
    return window.bootstrap?.Offcanvas?.getOrCreateInstance(el);
  };

  const closeMenu = () => {
    try {
      const inst = getInst();
      inst?.hide?.();
    } catch {}
  };

  // ✅ keep icon state in sync with Bootstrap
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onShown = () => setIsMenuOpen(true);
    const onHidden = () => setIsMenuOpen(false);

    el.addEventListener("shown.bs.offcanvas", onShown);
    el.addEventListener("hidden.bs.offcanvas", onHidden);

    return () => {
      el.removeEventListener("shown.bs.offcanvas", onShown);
      el.removeEventListener("hidden.bs.offcanvas", onHidden);
    };
  }, []);

  // ✅ close when route changes (safe)
  useEffect(() => {
    if (window.innerWidth < 992) closeMenu();
  }, [location.pathname]);

  // ✅ IMPORTANT: close first, then navigate
  const go = (path) => {
    if (window.innerWidth < 992) {
      closeMenu();
      // wait a tiny moment so Bootstrap can animate/hide properly
      setTimeout(() => nav(path), 120);
    } else {
      nav(path);
    }
  };

  const SideBtn = ({ to, icon, label, active }) => (
    <button
      type="button"
      onClick={() => go(to)}
      className={`admin-link d-flex align-items-center gap-2 admin-btn ${active ? "active" : ""}`}
      style={{ width: "100%", textAlign: "left" }}
    >
      <span className="admin-nav-ico" aria-hidden="true">{icon}</span>
      <span className="admin-nav-text">{label}</span>
    </button>
  );

  const isActive = (to) => {
    if (to === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(to);
  };

  return (
    <div className="admin-shell">
      {/* ✅ MOBILE TOPBAR */}
      <header className="admin-topbar d-lg-none">
        <div className="container-fluid px-3">
          <div className="admin-topbar-row">
            <button
              className="btn btn-outline-light rounded-4 admin-menu-btn"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#adminSidebarCanvas"
              aria-controls="adminSidebarCanvas"
              aria-label="Toggle admin menu"
            >
              <span className="admin-menu-icon">{isMenuOpen ? "✕" : "☰"}</span>
            </button>

            <div className="admin-topbar-mid">
              <div className="admin-topbar-brand text-truncate">🎬 Cinema Admin</div>
              <div className="admin-topbar-title text-truncate">{pageTitle}</div>
            </div>

            <span className="admin-badge d-none d-sm-inline-flex">ADMIN</span>
          </div>
        </div>
      </header>

      <div className="admin-wrap d-flex">
        {/* ✅ DESKTOP SIDEBAR */}
        <aside className="admin-sidebar d-none d-lg-flex flex-column p-3">
          <div className="glass-card p-3 mb-3">
            <div className="d-flex align-items-start justify-content-between">
              <div className="me-2" style={{ minWidth: 0 }}>
                <div className="fw-bold text-white">🎬 Cinema Admin</div>
                <div className="small admin-muted text-truncate">{user?.email}</div>
              </div>
              <span className="admin-badge">ADMIN</span>
            </div>
          </div>

          <nav className="d-flex flex-column gap-2">
            <SideBtn to="/admin" icon="📊" label="Dashboard" active={isActive("/admin")} />
            <SideBtn to="/admin/movies" icon="🎞️" label="Movies" active={isActive("/admin/movies")} />
            <SideBtn to="/admin/halls" icon="🏛️" label="Halls" active={isActive("/admin/halls")} />
            <SideBtn to="/admin/shows" icon="🕒" label="Shows" active={isActive("/admin/shows")} />
            <SideBtn to="/admin/bookings" icon="🎟️" label="Bookings" active={isActive("/admin/bookings")} />
          </nav>

          <div className="mt-auto pt-3">
            <button className="btn btn-danger w-100 rounded-4" onClick={logout}>
              Logout
            </button>
          </div>
        </aside>

        {/* ✅ MOBILE OFFCANVAS */}
        <div
          className="offcanvas offcanvas-start admin-offcanvas text-bg-dark"
          tabIndex="-1"
          id="adminSidebarCanvas"
          ref={canvasRef}
          aria-labelledby="adminSidebarCanvasLabel"
        >
          <div className="offcanvas-header">
            <div style={{ minWidth: 0 }}>
              <div className="fw-bold" id="adminSidebarCanvasLabel">
                🎬 Cinema Admin
              </div>
              <div className="small admin-muted text-truncate">{user?.email}</div>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>

          <div className="offcanvas-body d-flex flex-column gap-2">
            <SideBtn to="/admin" icon="📊" label="Dashboard" active={isActive("/admin")} />
            <SideBtn to="/admin/movies" icon="🎞️" label="Movies" active={isActive("/admin/movies")} />
            <SideBtn to="/admin/halls" icon="🏛️" label="Halls" active={isActive("/admin/halls")} />
            <SideBtn to="/admin/shows" icon="🕒" label="Shows" active={isActive("/admin/shows")} />
            <SideBtn to="/admin/bookings" icon="🎟️" label="Bookings" active={isActive("/admin/bookings")} />

            <div className="mt-auto pt-3">
              <button
                className="btn btn-danger w-100 rounded-4"
                onClick={() => {
                  closeMenu();
                  logout();
                  setTimeout(() => nav("/login", { replace: true }), 120);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MAIN */}
        <main className="admin-main flex-grow-1">
          <div className="container-fluid p-3 p-lg-4">
            <div className="glass-card p-3 p-lg-4 mb-3 mb-lg-4">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div style={{ minWidth: 0 }}>
                  <h1 className="admin-page-title">{pageTitle}</h1>
                  <div className="small admin-muted">
                    Manage movies, halls, shows, and bookings in real time.
                  </div>
                </div>
                <span className="admin-badge d-none d-md-inline-flex">⚡ Real-time Booking System</span>
              </div>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
