import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cinFooter mt-5">
      <style>{`
        .cinFooter{
          margin-top: 26px;
          padding: 26px 0 18px;
          color: rgba(255,255,255,0.78);
          background:
            radial-gradient(900px 420px at 10% 10%, rgba(255, 0, 153, 0.12), transparent 55%),
            radial-gradient(900px 420px at 90% 10%, rgba(0, 224, 255, 0.10), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.0));
          border-top: 1px solid rgba(255,255,255,0.10);
        }
        .glassF{
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 18px 60px rgba(0,0,0,0.35);
        }
        .brand{
          font-weight: 950;
          font-size: 18px;
          color: #fff;
          letter-spacing: .02em;
        }
        .tiny{ font-size: 12px; color: rgba(255,255,255,0.55); }
        .footerLink{
          color: rgba(255,255,255,0.78);
          text-decoration: none;
        }
        .footerLink:hover{ color: #fff; text-decoration: underline; }
        .dot{
          width: 10px; height: 10px;
          border-radius: 6px;
          background: rgba(0,255,128,0.20);
          border: 1px solid rgba(0,255,128,0.40);
        }
        .social{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          transition: transform .12s ease, filter .12s ease;
        }
        .social:hover{
          transform: translateY(-2px);
          filter: brightness(1.08);
          color: #fff;
        }
      `}</style>

      <div className="container">
        <div className="glassF p-4">
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="d-flex align-items-center gap-2">
                <span className="dot" />
                <div className="brand">Cinema Booking</div>
              </div>
              <div className="mt-2">
                Book movie seats with <b className="text-white">real-time seat locking</b> and a
                smooth mobile-friendly experience.
              </div>
              <div className="tiny mt-3">
                Built with React + Node + MongoDB + Socket.io
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="fw-bold text-white mb-2">Quick Links</div>
              <div className="d-flex flex-column gap-2">
                <Link className="footerLink" to="/">Home</Link>
                <Link className="footerLink" to="/my-bookings">My Bookings</Link>
                <Link className="footerLink" to="/login">Login</Link>
                <Link className="footerLink" to="/register">Register</Link>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="fw-bold text-white mb-2">Contact</div>
              <div className="d-flex flex-column gap-2">
                <div>📞 +94 77 000 0000</div>
                <div>✉️ support@cinema.lk</div>
                <div>📍 Colombo, Sri Lanka</div>
              </div>
            </div>

            <div className="col-12 col-lg-3">
              <div className="fw-bold text-white mb-2">Follow</div>
              <div className="d-flex gap-2 flex-wrap">
                <a className="social" href="#" title="Facebook" onClick={(e)=>e.preventDefault()}>f</a>
                <a className="social" href="#" title="Instagram" onClick={(e)=>e.preventDefault()}>◎</a>
                <a className="social" href="#" title="YouTube" onClick={(e)=>e.preventDefault()}>▶</a>
                <a className="social" href="#" title="X" onClick={(e)=>e.preventDefault()}>x</a>
              </div>

              <div className="tiny mt-3">
                Privacy • Terms • Refund Policy (placeholders)
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.10)" }} />

          <div className="d-flex justify-content-between flex-wrap gap-2 tiny">
            <div>© {year} Cinema Booking System. All rights reserved.</div>
            <div>Made for SE2 project • NSBM (Plymouth University)</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
