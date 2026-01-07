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
        .authWrap{
          min-height: 100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 28px 14px;
          background:
            radial-gradient(900px 450px at 15% 15%, rgba(46,204,113,0.14), transparent 60%),
            radial-gradient(900px 500px at 85% 10%, rgba(106,17,203,0.20), transparent 55%),
            linear-gradient(180deg, #070A12, #0B1020);
        }
        .authCard{
          width: min(480px, 100%);
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
          font-weight: 800;
        }
        .authFooterLink{ color: rgba(255,255,255,0.85); text-decoration: underline; }
      `}</style>

      <div className="authWrap">
        <div className="authCard">
          <div className="p-4">
            <div className="mb-3">
              <div className="authDim small text-uppercase" style={{ letterSpacing: ".2em" }}>
                Create Account
              </div>
              <h3 className="authTitle mb-1">Join CinemaApp</h3>
              <div className="authDim">Sign up to book seats in real time.</div>
            </div>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label authDim">Name</label>
                <input
                  className="form-control authInput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="form-label authDim">Email</label>
                <input
                  className="form-control authInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="form-label authDim">Password</label>
                <input
                  type="password"
                  className="form-control authInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                <div className="authDim small mt-1">Minimum 6 characters.</div>
              </div>

              <button className="btn btn-success authBtn" disabled={busy}>
                {busy ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="mt-3 authDim small">
              Already have an account?{" "}
              <Link className="authFooterLink" to="/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
