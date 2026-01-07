import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function fmtDateTime(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}

export default function ShowtimesModal({
  open,
  onClose,
  movie,
  shows = [],
  loading = false,
  error = "",
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <style>{`
        .glass-card{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 70px rgba(0,0,0,0.55);
          color: #fff;
        }

        .cinModalBackdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.68);
          z-index: 9998;
        }

        .cinModalWrap{
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 14px;
          z-index: 9999;
        }

        .cinModal{
          width: min(900px, 100%);
          max-height: 86vh;
          overflow: auto;
        }

        .cinModalHeader{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
        }

        .cinModalKicker{
          font-size:12px;
          letter-spacing:.18em;
          text-transform:uppercase;
          color: rgba(255,255,255,0.65);
        }

        .cinModalTitle{
          font-weight: 950;
          font-size: 18px;
        }

        .cinModalSub{
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          margin-top: 2px;
        }

        .cinModalBody{ padding: 16px; }

        .cinModalFooter{
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.10);
        }

        .cinShowGrid{
          display:grid;
          gap: 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (max-width: 991.98px){
          .cinShowGrid{ grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 575.98px){
          .cinShowGrid{ grid-template-columns: 1fr; }
        }

        /* ✅ tighter card (no big empty space) */
        .cinShowCard{
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          border-radius: 18px;
          padding: 14px;

          display: flex;
          flex-direction: column;
          gap: 10px; /* nice consistent spacing */
        }

        .cinShowTop{
          display:flex;
          justify-content: space-between;
          align-items:flex-start;
          gap: 10px;
        }

        .cinShowLeft{
          min-width: 0;
          flex: 1;
        }

        /* ✅ keep time in one line */
        .cinShowTime{
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .cinShowMeta{
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          margin-top: 2px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cinPriceBadge{
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* ✅ This replaces min-height: add a flex spacer */
        .cinSpacer{
          flex: 1;
        }

        .cinBookBtn{
          width: 100%;
          border-radius: 16px;
          font-weight: 700;
        }

        .cinEmptyBox{
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 14px;
          color: rgba(255,255,255,0.80);
        }
      `}</style>

      <div className="cinModalBackdrop" onClick={onClose} />

      <div className="cinModalWrap" role="dialog" aria-modal="true">
        <div className="cinModal glass-card">
          <div className="cinModalHeader">
            <div>
              <div className="cinModalKicker">Showtimes</div>
              <div className="cinModalTitle">{movie?.title || "Movie"}</div>
              <div className="cinModalSub">Select a showtime to book seats</div>
            </div>

            <button
              className="btn btn-sm btn-outline-light rounded-4"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className="cinModalBody">
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-white-50">Loading showtimes…</div>
            ) : shows.length === 0 ? (
              <div className="cinEmptyBox">No shows available yet.</div>
            ) : (
              <div className="cinShowGrid">
                {shows.map((s) => (
                  <div key={s._id} className="cinShowCard">
                    <div className="cinShowTop">
                      <div className="cinShowLeft">
                        <div className="cinShowTime">{fmtDateTime(s.startTime)}</div>
                        <div className="cinShowMeta">
                          Hall: {s?.hallId?.name || "—"}
                        </div>
                      </div>

                      <span className="badge text-bg-success cinPriceBadge">
                        LKR {s.price}
                      </span>
                    </div>

                    {/* ✅ Spacer pushes button down only when needed */}
                    <div className="cinSpacer" />

                    <Link
                      to={`/show/${s._id}`}
                      className="btn btn-primary cinBookBtn"
                      onClick={onClose}
                    >
                      Book Seats
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cinModalFooter">
            <div className="small text-white-50">
              Tip: Seat availability updates in real time.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
