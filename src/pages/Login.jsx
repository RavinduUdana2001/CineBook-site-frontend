import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, isAuthed, user, authReady } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@cinema.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthed) return;

    nav(user?.role === "admin" ? "/admin" : "/", { replace: true });
  }, [authReady, isAuthed, user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const u = await login(email, password);

      const from = location.state?.from?.pathname;

      if (u?.role === "admin") {
        nav(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
      } else {
        nav(from && !from.startsWith("/admin") ? from : "/", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        .authWrap{
          min-height: calc(100vh - 0px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 28px 14px;
          background:
            radial-gradient(900px 450px at 15% 15%, rgba(37,117,252,0.18), transparent 60%),
            radial-gradient(900px 500px at 85% 10%, rgba(106,17,203,0.22), transparent 55%),
            linear-gradient(180deg, #070A12, #0B1020);
        }
        .authCard{
          width: min(460px, 100%);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 22px;
          backdrop-filter: blur(14px);
          box-shadow: 0 22px 70px rgba(0,0,0,0.55);
          color: #fff;
        }
        .authTitle{ font-weight: 900; letter-spacing: .2px; }
        .authDim{ color: rgba(255,255,255,0.7); }
        .authInput{
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.16) !important;
          color: #fff !important;
          border-radius: 14px !important;
          padding: 12px 12px !important;
        }
        .authInput::placeholder{ color: rgba(255,255,255,0.55); }
        .authBtn{
          border-radius: 14px;
          padding: 11px 14px;
          font-weight: 700;
        }
        .authFooterLink{ color: rgba(255,255,255,0.8); }
      `}</style>

      <div className="authWrap">
        <div className="authCard">
          <div className="p-4 p-md-4">
            <div className="mb-3">
              <div className="authDim small text-uppercase" style={{ letterSpacing: ".2em" }}>
                Cinema Booking System
              </div>
              <h3 className="authTitle mb-1">Welcome back</h3>
              <div className="authDim">Sign in to continue.</div>
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label authDim">Email</label>
                <input
                  className="form-control authInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="form-label authDim">Password</label>
                <input
                  type="password"
                  className="form-control authInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Your password"
                />
              </div>

              <button className="btn btn-primary authBtn" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-3 authDim small">
              No account?{" "}
              <Link className="authFooterLink" to="/signup">
                Create one
              </Link>
            </div>


          </div>
        </div>
      </div>
    </>
  );
}
