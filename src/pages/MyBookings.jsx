import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

function fmtDateTime(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}
function isPast(date) {
  const t = new Date(date).getTime();
  if (!Number.isFinite(t)) return false;
  return t < Date.now();
}

export default function MyBookings() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [tab, setTab] = useState("upcoming"); // upcoming | past | all

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/bookings/my"); // -> /api/bookings/my
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const totalBookings = items.length;
    const totalTickets = items.reduce((sum, b) => sum + (b?.seats?.length || 0), 0);
    const totalSpend = items.reduce((sum, b) => sum + Number(b?.total || 0), 0);
    return { totalBookings, totalTickets, totalSpend };
  }, [items]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return items
      .filter((b) => {
        const show = b?.showId;
        const movie = show?.movieId;
        const hall = show?.hallId;

        const showTime = show?.startTime;
        const past = isPast(showTime);

        if (tab === "upcoming" && past) return false;
        if (tab === "past" && !past) return false;

        if (!text) return true;

        const hay = [
          movie?.title,
          hall?.name,
          fmtDateTime(showTime),
          (b?.seats || []).join(" "),
          b?._id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(text);
      })
      .sort((a, b) => {
        const ta = new Date(a?.showId?.startTime || 0).getTime();
        const tb = new Date(b?.showId?.startTime || 0).getTime();
        // upcoming: soonest first, past: latest first, all: latest first
        if (tab === "upcoming") return ta - tb;
        return tb - ta;
      });
  }, [items, q, tab]);

  return (
    <div className="myBkPage">
      <style>{`
        .myBkPage{
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 10% 10%, rgba(255, 0, 153, 0.16), transparent 55%),
            radial-gradient(900px 520px at 90% 10%, rgba(0, 224, 255, 0.14), transparent 55%),
            radial-gradient(900px 520px at 50% 90%, rgba(0, 255, 128, 0.10), transparent 55%),
            linear-gradient(180deg, #070A12, #0B1020);
          color: #fff;
          padding: 18px 0 28px;
        }

        .glass{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.40);
        }

        .muted{ color: rgba(255,255,255,0.72); }
        .muted2{ color: rgba(255,255,255,0.56); }

        .title{
          font-weight: 950;
          font-size: 24px;
          line-height: 1.15;
          margin: 0;
        }
        @media (max-width: 575.98px){
          .title{ font-size: 19px; }
        }

        .kicker{
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.70);
        }

        .topCard{ padding: 14px; }

        .pillRow{
          display:flex;
          flex-wrap:wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .pill{
          display:inline-flex;
          align-items:center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.84);
          font-size: 12px;
          white-space: nowrap;
        }

        .searchRow{
          display:flex;
          flex-wrap:wrap;
          gap: 10px;
          margin-top: 12px;
        }
        .searchInput{
          flex: 1 1 260px;
          min-width: 240px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #fff;
          padding: 10px 12px;
          outline: none;
        }
        .searchInput::placeholder{ color: rgba(255,255,255,0.45); }

        .seg{
          display:flex;
          gap: 8px;
          flex-wrap:wrap;
        }
        .segBtn{
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          font-weight: 800;
          font-size: 12px;
        }
        .segBtn.active{
          border-color: rgba(0,255,170,0.45);
          box-shadow: 0 0 0 4px rgba(0,255,170,0.07) inset;
          color: #fff;
        }

        .bkCard{
          padding: 14px;
          height: 100%;
        }

        .badgeMoney{
          border-radius: 999px;
          padding: 7px 10px;
          border: 1px solid rgba(0,255,128,0.35);
          background: rgba(0,255,128,0.10);
          color: rgba(255,255,255,0.95);
          font-weight: 950;
          font-size: 12px;
          white-space: nowrap;
        }
        .badgePast{
          border-radius: 999px;
          padding: 6px 10px;
          border: 1px solid rgba(255,205,0,0.35);
          background: rgba(255,205,0,0.10);
          color: rgba(255,255,255,0.92);
          font-weight: 900;
          font-size: 12px;
          white-space: nowrap;
        }
        .badgeUpcoming{
          border-radius: 999px;
          padding: 6px 10px;
          border: 1px solid rgba(0,224,255,0.30);
          background: rgba(0,224,255,0.10);
          color: rgba(255,255,255,0.92);
          font-weight: 900;
          font-size: 12px;
          white-space: nowrap;
        }

        .movieTitle{
          font-weight: 950;
          font-size: 18px;
          margin: 0;
          line-height: 1.15;
        }

        .divider{
          height: 1px;
          background: rgba(255,255,255,0.10);
          margin: 12px 0;
        }

        .seatChips{
          display:flex;
          flex-wrap:wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .chip{
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          font-size: 12px;
          color: rgba(255,255,255,0.86);
          white-space: nowrap;
        }

        .btnSoft{
          border-radius: 14px;
          font-weight: 900;
        }

        .emptyCard{
          padding: 18px;
          text-align: center;
        }

        .skeleton{
          height: 88px;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          position: relative;
          overflow: hidden;
        }
        .skeleton::after{
          content:"";
          position:absolute;
          inset:0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer{
          100%{ transform: translateX(100%); }
        }
      `}</style>

      <div className="container">
        {/* TOP HEADER */}
        <div className="glass topCard mb-3 mt-2 mt-lg-5">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <div className="kicker">Bookings</div>
              <h2 className="title">🎟️ My Bookings</h2>
              <div className="muted mt-1">
                See your tickets, seats, and show details.
              </div>
            </div>

            <div className="pillRow">
              <span className="pill">📦 {stats.totalBookings} bookings</span>
              <span className="pill">🪑 {stats.totalTickets} seats</span>
              <span className="pill">
                💰 LKR {stats.totalSpend.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="searchRow">
            <input
              className="searchInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by movie, hall, seat, date..."
            />

            <div className="seg">
              <button
                type="button"
                className={"segBtn " + (tab === "upcoming" ? "active" : "")}
                onClick={() => setTab("upcoming")}
              >
                ⏳ Upcoming
              </button>
              <button
                type="button"
                className={"segBtn " + (tab === "past" ? "active" : "")}
                onClick={() => setTab("past")}
              >
                🕘 Past
              </button>
              <button
                type="button"
                className={"segBtn " + (tab === "all" ? "active" : "")}
                onClick={() => setTab("all")}
              >
                📋 All
              </button>
            </div>
          </div>

          {err ? <div className="alert alert-danger mt-3 mb-0">{err}</div> : null}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="row g-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="col-12 col-lg-6" key={i}>
                <div className="skeleton" />
              </div>
            ))}
          </div>
        ) : !err && filtered.length === 0 ? (
          <div className="glass emptyCard">
            <div style={{ fontSize: 42 }}>🍿</div>
            <div className="fw-bold mt-2" style={{ fontSize: 18 }}>
              No bookings found
            </div>
            <div className="muted mt-1">
              Try changing the filter or book a movie first.
            </div>
            <button
              className="btn btn-success btnSoft mt-3"
              onClick={() => nav("/", { replace: true })}
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((b) => {
              const show = b?.showId;
              const movie = show?.movieId;
              const hall = show?.hallId;

              const showTime = show?.startTime;
              const past = isPast(showTime);

              return (
                <div className="col-12 col-lg-6" key={b._id}>
                  <div className="glass bkCard">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div style={{ minWidth: 0 }}>
                        <div className="movieTitle text-truncate">
                          {movie?.title || "Movie"}
                        </div>

                        <div className="muted small mt-1">
                          {hall?.name || "Hall"} • {fmtDateTime(showTime)}
                        </div>
                      </div>

                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className="badgeMoney">
                          LKR {Number(b?.total || 0).toLocaleString()}
                        </span>
                        <span className={past ? "badgePast" : "badgeUpcoming"}>
                          {past ? "PAST SHOW" : "UPCOMING"}
                        </span>
                      </div>
                    </div>

                    <div className="divider" />

                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="muted2 small">Seats</div>
                        <div className="seatChips">
                          {(b?.seats || []).map((s) => (
                            <span key={s} className="chip">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="muted2 small">Booked on</div>
                        <div className="muted small">{fmtDateTime(b?.createdAt)}</div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-outline-light w-100 btnSoft"
                        onClick={() => nav(`/show/${show?._id || show?.id}`)}
                        disabled={!show?._id && !show?.id}
                      >
                        View Seats
                      </button>

                      <button
                        type="button"
                        className="btn btn-success w-100 btnSoft"
                        onClick={() => nav("/", { replace: true })}
                      >
                        Book Again
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-center muted2 small">
          Tip: Use search to find seats like <b className="text-white">A1</b> or a movie name.
        </div>
      </div>
    </div>
  );
}
