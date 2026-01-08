import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        .cineSignupPage{
          min-height: 100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 28px 14px;
          background:
            radial-gradient(900px 450px at 15% 15%, rgba(46,204,113,0.14), transparent 60%),
            radial-gradient(900px 520px at 85% 10%, rgba(45,107,255,0.18), transparent 55%),
            radial-gradient(900px 520px at 45% 90%, rgba(255, 77, 77, 0.12), transparent 60%),
            linear-gradient(180deg, #070A12, #0B1020);
          color: #fff;
        }

        .cineCard{
          width: min(560px, 100%);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 90px rgba(0,0,0,0.60);
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .cineTop{
          padding: 22px 22px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
          background: linear-gradient(135deg, rgba(46,204,113,0.14), rgba(255,255,255,0.02));
        }

        .brandRow{
          display:flex;
          align-items:center;
          justify-content:center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .brandIcon{
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display:grid;
          place-items:center;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
        }

        .brandName{
          font-weight: 950;
          letter-spacing: .2px;
          font-size: 22px;
          margin: 0;
          line-height: 1;
        }

        .brandTag{
          text-align:center;
          color: rgba(255,255,255,0.74);
          font-size: 13px;
        }

        .cineBody{
          padding: 22px;
        }

        .sectionTitle{
          text-align:center;
          margin: 0 0 6px;
          font-weight: 900;
          font-size: 22px;
          letter-spacing: .2px;
        }

        .sectionSub{
          text-align:center;
          color: rgba(255,255,255,0.72);
          margin-bottom: 14px;
          font-size: 13px;
        }

        .cineLabel{
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          margin-bottom: 6px;
        }

        .cineInput{
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.16) !important;
          color: #fff !important;
          border-radius: 14px !important;
          padding: 12px 12px !important;
        }

        .cineInput::placeholder{ color: rgba(255,255,255,0.55); }

        .helpText{
          color: rgba(255,255,255,0.65);
          font-size: 12px;
          margin-top: 6px;
        }

        .cineBtn{
          border-radius: 14px !important;
          padding: 11px 14px !important;
          font-weight: 900 !important;
          letter-spacing: .2px;
        }

        .cineBtnSuccess{
          background: rgba(46,204,113,0.92) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          box-shadow: 0 16px 45px rgba(46,204,113,0.20);
        }

        .cineLink{
          color: rgba(255,255,255,0.85);
          text-decoration: none;
        }
        .cineLink:hover{ text-decoration: underline; color:#fff; }

        .cineFooter{
          padding: 14px 22px 18px;
          border-top: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.65);
          font-size: 12px;
          display:flex;
          justify-content:space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 420px){
          .brandName{ font-size: 20px; }
          .cineBody{ padding: 18px; }
        }
      `}</style>

      <div className="cineSignupPage">
        <div className="cineCard">
          {/* TOP BRAND HEADER */}
          <div className="cineTop">
            <div className="brandRow">
              <div className="brandIcon" aria-hidden="true">
                {/* 🎬 cinema SVG icon (no dependencies) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 7V5a1 1 0 0 1 1-1h2v3M14 7V4h2a1 1 0 0 1 1 1v2"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 12h6M9 15h6"
                    stroke="rgba(255,255,255,0.78)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1 className="brandName">Cinebook</h1>
            </div>
            <div className="brandTag">Create your account and start booking in seconds</div>
          </div>

          {/* BODY */}
          <div className="cineBody">
            <h2 className="sectionTitle">Create account</h2>
            <div className="sectionSub">
              Join Cinebook to reserve seats with real-time updates.
            </div>

            {error ? <div className="alert alert-danger mb-3">{error}</div> : null}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <div>
                <div className="cineLabel">Full name</div>
                <input
                  className="form-control cineInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <div className="cineLabel">Email</div>
                <input
                  className="form-control cineInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="cineLabel">Password</div>
                <input
                  type="password"
                  className="form-control cineInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                <div className="helpText">Use at least 6 characters.</div>
              </div>

              <button className="btn cineBtn cineBtnSuccess" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="text-center mt-3" style={{ color: "rgba(255,255,255,0.72)" }}>
              Already have an account?{" "}
              <Link className="cineLink" to="/login">
                Sign in
              </Link>
            </div>
          </div>

          {/* FOOTER */}
          <div className="cineFooter">
            <span>© {new Date().getFullYear()} Cinebook</span>
            <span>Secure authentication • Clean UI</span>
          </div>
        </div>
      </div>
    </>
  );
}
