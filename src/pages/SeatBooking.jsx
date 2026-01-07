import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../api/http";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext";

const safeArr = (x) => (Array.isArray(x) ? x : []);
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const INACTIVITY_MS = 15 * 60 * 1000;

function fmtDateTime(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}

function seatLabel(r, c) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${letters[r] || "?"}${c + 1}`;
}

export default function SeatBooking() {
  const { id: showId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [show, setShow] = useState(null);
  const [hall, setHall] = useState(null);

  const [booked, setBooked] = useState([]);
  const [locks, setLocks] = useState({});
  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [socketOk, setSocketOk] = useState(false);

  // ✅ SUCCESS POPUP
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState({ bookingId: "", total: 0 });

  const socketRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef(null);
  const syncTimerRef = useRef(null);

  // ===== Load show =====
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get(`/shows/${showId}`);
        setShow(res.data);
        setHall(res?.data?.hallId || null);
        setBooked(safeArr(res?.data?.bookedSeats));
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load show.");
      } finally {
        setLoading(false);
      }
    })();
  }, [showId]);

  // ===== Activity tracking =====
  useEffect(() => {
    const mark = () => (lastActivityRef.current = Date.now());
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) =>
      window.addEventListener(ev, mark, { passive: true })
    );
    return () =>
      events.forEach((ev) => window.removeEventListener(ev, mark));
  }, []);

  // ===== Socket =====
  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;

    s.on("connect", () => setSocketOk(true));
    s.on("disconnect", () => setSocketOk(false));

    s.emit("joinShow", { showId, userId });

    s.on("showState", (payload) => {
      setBooked(safeArr(payload?.bookedSeats));
      setLocks(payload?.locks || {});
    });

    s.on("locksUpdated", (payload) => {
      setLocks(payload?.locks || payload || {});
    });

    s.on("seatsBooked", (payload) => {
      const seats = safeArr(payload?.seats || payload?.bookedSeats || payload);
      if (!seats.length) return;
      setBooked((prev) => Array.from(new Set([...prev, ...seats])));
      setSelected((prev) => prev.filter((x) => !seats.includes(x)));
    });

    s.on("lockRejected", (payload) => {
      const seat = payload?.seatId || payload?.seat;
      if (seat) setSelected((prev) => prev.filter((x) => x !== seat));
    });

    s.on("errorMsg", (p) => {
      if (p?.message) setErr(p.message);
    });

    return () => {
      try {
        s.disconnect();
      } catch {}
    };
  }, [showId, userId]);

  // ===== Local cleanup for expired locks =====
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      setLocks((prev) => {
        if (!prev) return prev;
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const seatId of Object.keys(next)) {
          if (next[seatId]?.expiresAt && next[seatId].expiresAt <= now) {
            delete next[seatId];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2000);

    return () => syncTimerRef.current && clearInterval(syncTimerRef.current);
  }, []);

  // ===== Inactivity kick (15 mins) =====
  useEffect(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);

    idleTimerRef.current = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= INACTIVITY_MS) {
        try {
          selected.forEach((seatId) => {
            socketRef.current?.emit("unlockSeat", { showId, seatId, userId });
          });
        } catch {}
        nav("/", { replace: true });
      }
    }, 1000);

    return () => idleTimerRef.current && clearInterval(idleTimerRef.current);
  }, [nav, selected, showId, userId]);

  // ===== Derived =====
  const price = Number(show?.price || 0);
  const selectedCount = selected.length;
  const total = selectedCount * price;

  const rows = Number(hall?.rows || 0);
  const cols = Number(hall?.cols || 0);

  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const lockInfo = useMemo(() => locks || {}, [locks]);

  function isSeatLocked(seatId) {
    const info = lockInfo?.[seatId];
    if (!info) return false;
    if (info.expiresAt && info.expiresAt <= Date.now()) return false;
    return true;
  }
  function isLockedByMe(seatId) {
    const info = lockInfo?.[seatId];
    if (!info) return false;
    if (info.expiresAt && info.expiresAt <= Date.now()) return false;
    return info.userId === userId;
  }

  function canSelectSeat(seatId) {
    if (bookedSet.has(seatId)) return false;
    if (isSeatLocked(seatId) && !isLockedByMe(seatId)) return false;
    return true;
  }

  function toggleSeat(seatId) {
    if (busy) return;

    if (selected.includes(seatId)) {
      setSelected((p) => p.filter((x) => x !== seatId));
      socketRef.current?.emit("unlockSeat", { showId, seatId, userId });
      return;
    }

    if (!canSelectSeat(seatId)) return;

    setSelected((p) => [...p, seatId]);
    socketRef.current?.emit("lockSeat", { showId, seatId, userId });
  }

  async function confirmBooking() {
    if (busy || !selected.length) return;
    setBusy(true);
    setErr("");

    try {
      const res = await http.post("/bookings", { showId, seats: selected });
      socketRef.current?.emit("bookingConfirmed", { showId, seats: selected });

      setSuccessData({
        bookingId: res?.data?.bookingId || "",
        total: res?.data?.total || total,
      });
      setSuccessOpen(true);
      setSelected([]);
    } catch (e) {
      setErr(e?.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // ===== Aisle layout =====
  const aisleSize = cols >= 14 ? 2 : cols >= 10 ? 1 : 0;
  const leftCols = Math.floor((cols - aisleSize) / 2);
  const rightCols = cols - aisleSize - leftCols;

  return (
    <div className="cinSeatPage">
      {/* ✅ Success modal */}
      {successOpen ? (
        <div className="cinModalBackdrop" onClick={() => setSuccessOpen(false)}>
          <div className="cinModal glass" onClick={(e) => e.stopPropagation()}>
            <div className="fw-bold" style={{ fontSize: 18 }}>
              ✅ Booking Confirmed!
            </div>

            <div className="muted2 mt-2">
              Total:{" "}
              <b className="text-white">
                LKR {Number(successData.total || 0).toLocaleString()}
              </b>
              {successData.bookingId ? (
                <>
                  <br />
                  Booking ID:{" "}
                  <span className="muted">{successData.bookingId}</span>
                </>
              ) : null}
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-success w-100"
                onClick={() => nav("/my-bookings", { replace: true })}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-outline-light w-100"
                onClick={() => nav("/", { replace: true })}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .cinSeatPage{
          min-height: 100vh;
          background:
            radial-gradient(900px 520px at 10% 10%, rgba(255, 0, 153, 0.16), transparent 55%),
            radial-gradient(900px 520px at 90% 10%, rgba(0, 224, 255, 0.14), transparent 55%),
            radial-gradient(900px 520px at 50% 90%, rgba(0, 255, 128, 0.10), transparent 55%),
            linear-gradient(180deg, #070A12, #0B1020);
          color: #fff;
          padding: 14px 0 26px;
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

        .kicker{
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.70);
        }
        .title{
          font-weight: 950;
          font-size: 22px;
          margin: 2px 0 0;
          line-height: 1.15;
        }
        @media (max-width: 575.98px){
          .title{ font-size: 18px; }
        }

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
        .pill.ok{
          border-color: rgba(0,255,170,0.38);
          box-shadow: 0 0 0 4px rgba(0,255,170,0.06) inset;
        }
        .pill.warn{
          border-color: rgba(255,205,0,0.35);
          box-shadow: 0 0 0 4px rgba(255,205,0,0.06) inset;
        }

        .detailsCard{ padding: 14px; }
        .seatCard{ padding: 14px; }
        .summaryCard{ padding: 14px; }

        @media (min-width: 992px){
          .summaryCard{ position: sticky; top: 84px; }
        }

        .screenWrap{
          position: relative;
          margin: 12px 0 14px;
          height: 52px;
          display:flex;
          align-items:flex-end;
          justify-content:center;
        }
        .screenArc{
          width: min(520px, 100%);
          height: 40px;
          border-radius: 999px 999px 18px 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.14);
          filter: drop-shadow(0 18px 25px rgba(0,0,0,0.35));
          position: relative;
          overflow:hidden;
        }
        .screenArc::after{
          content:"SCREEN";
          position:absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 11px;
          letter-spacing: .22em;
          color: rgba(255,255,255,0.75);
        }

        /* ===== Seats responsive ===== */
        .seatGridScroller{
          overflow:auto;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
        }

        :root{
          --seat: clamp(24px, 5.3vw, 34px);
          --gap: clamp(6px, 1.2vw, 10px);
          --radius: 12px;
          --labelW: 22px;
          --aisleW: clamp(14px, 2.8vw, 22px);
        }

        .seatHall{
          display:flex;
          flex-direction:column;
          gap: var(--gap);
          padding: 10px;
          min-width: max-content;
          width: max-content;
          margin: 0 auto;
        }

        .seatRow{
          display:flex;
          align-items:center;
          gap: var(--gap);
        }

        .rowLabel{
          width: var(--labelW);
          text-align:right;
          font-size: 12px;
          color: rgba(255,255,255,0.60);
          padding-right: 6px;
          user-select: none;
          flex-shrink: 0;
        }

        .seatBlock{ display:flex; gap: var(--gap); }
        .seatAisle{
          width: calc(var(--aisleW) * ${aisleSize || 0});
          flex: 0 0 auto;
        }

        .seatBtn{
          width: var(--seat);
          height: var(--seat);
          border-radius: var(--radius);
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.86);
          display:grid;
          place-items:center;
          font-size: 11px;
          cursor:pointer;
          user-select:none;
          position: relative;
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
          box-shadow: 0 12px 22px rgba(0,0,0,0.20);
        }
        .seatBtn::before{
          content:"";
          position:absolute;
          inset: 2px;
          border-radius: calc(var(--radius) - 2px);
          background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
          opacity: .9;
          pointer-events:none;
        }
        .seatBtn:hover{
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 18px 30px rgba(0,0,0,0.28);
        }
        .seatBtn:disabled{
          cursor:not-allowed;
          opacity: .55;
          transform:none;
        }

        .seatBtn.available{ border-color: rgba(0, 224, 255, 0.22); }

        .seatBtn.booked{
          background: linear-gradient(180deg, rgba(255,77,77,0.16), rgba(255,77,77,0.08));
          border-color: rgba(255,77,77,0.50);
          box-shadow: 0 0 0 2px rgba(255,77,77,0.10), 0 18px 30px rgba(255,77,77,0.08);
        }

        .seatBtn.locked{
          background: linear-gradient(180deg, rgba(255,205,0,0.18), rgba(255,130,0,0.10));
          border-color: rgba(255,205,0,0.55);
          box-shadow: 0 0 0 2px rgba(255,205,0,0.14), 0 22px 45px rgba(255,205,0,0.08);
          animation: pulseLock 1.2s ease-in-out infinite;
        }
        @keyframes pulseLock{
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-1px); }
        }

        .seatBtn.mine, .seatBtn.selected{
          background: linear-gradient(180deg, rgba(0,255,128,0.32), rgba(0,255,128,0.14));
          border-color: rgba(0,255,128,0.65);
          box-shadow: 0 0 0 2px rgba(0,255,128,0.18), 0 22px 45px rgba(0,255,128,0.12);
          font-weight: 950;
        }

        .legend{
          display:flex;
          flex-wrap:wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .legendItem{
          display:flex;
          align-items:center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.78);
        }
        .dot{
          width: 14px;
          height: 14px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
        }
        .dot.av{ background: rgba(0,224,255,0.10); border-color: rgba(0,224,255,0.30); }
        .dot.sel{ background: rgba(0,255,128,0.18); border-color: rgba(0,255,128,0.55); }
        .dot.lock{ background: rgba(255,205,0,0.14); border-color: rgba(255,205,0,0.45); }
        .dot.book{ background: rgba(255,77,77,0.14); border-color: rgba(255,77,77,0.45); }

        .seatChips{
          display:flex;
          flex-wrap:wrap;
          gap: 8px;
          margin-top: 10px;
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

        .priceRow{
          display:flex;
          justify-content:space-between;
          gap: 10px;
          margin-top: 10px;
          color: rgba(255,255,255,0.82);
        }
        .priceRow strong{ color:#fff; }

        .confirmBtn{
          border-radius: 16px;
          font-weight: 950;
          padding: 12px 14px;
        }

        .cinModalBackdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 16px;
        }
        .cinModal{
          width: min(520px, 100%);
          padding: 18px;
        }
      `}</style>

      <div className="container mt-2 mt-lg-5">
        {/* DETAILS always top */}
        <div className="glass detailsCard mb-3">
          <div className="kicker">Seat Booking</div>

          <h1 className="title">
            {show?.movieId?.title || "Show"}{" "}
            <span className="muted2" style={{ fontWeight: 700 }}>
              • {hall?.name || "Hall"}
            </span>
          </h1>

          <div className="muted mt-1">
            {show?.startTime ? fmtDateTime(show.startTime) : "—"} •{" "}
            {price ? `LKR ${price.toLocaleString()}` : "—"}
          </div>

          <div className="pillRow">
            <span className={`pill ${socketOk ? "ok" : "warn"}`}>
              {socketOk ? "🟢 Live" : "🟡 Reconnecting"}
            </span>
            <span className="pill">🎟️ Selected: {selectedCount}</span>
            <span className="pill">💰 Total: LKR {total.toLocaleString()}</span>
          </div>

          {err ? <div className="alert alert-danger mt-3 mb-0">{err}</div> : null}
        </div>

        {/* ✅ MOBILE: Seats first, Summary last.
            ✅ DESKTOP: Seats left, Summary right. */}
        <div className="row g-3">
          {/* SEATS (mobile first) */}
          <div className="col-12 col-lg-8 order-1 order-lg-1">
            <div className="glass seatCard">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="kicker">Choose your seats</div>
                  <div className="muted2">
                    Green = your selection. Yellow = locked by others.
                  </div>
                </div>

                <div className="legend">
                  <div className="legendItem">
                    <span className="dot av" /> Available
                  </div>
                  <div className="legendItem">
                    <span className="dot sel" /> Selected (You)
                  </div>
                  <div className="legendItem">
                    <span className="dot lock" /> Locked (Other)
                  </div>
                  <div className="legendItem">
                    <span className="dot book" /> Booked
                  </div>
                </div>
              </div>

              <div className="screenWrap">
                <div className="screenArc" />
              </div>

              {loading ? (
                <div className="muted">Loading seats…</div>
              ) : !rows || !cols ? (
                <div className="muted">Hall layout not found.</div>
              ) : (
                <div className="seatGridScroller">
                  <div className="seatHall">
                    {Array.from({ length: rows }).map((_, r) => {
                      const rowLetter = seatLabel(r, 0).slice(0, 1);
                      return (
                        <div className="seatRow" key={r}>
                          <div className="rowLabel">{rowLetter}</div>

                          <div className="seatBlock">
                            {Array.from({ length: leftCols }).map((__, c) => {
                              const seatId = seatLabel(r, c);

                              const isBooked = bookedSet.has(seatId);
                              const locked = !isBooked && isSeatLocked(seatId);
                              const mine = locked && isLockedByMe(seatId);
                              const isSelected = selected.includes(seatId);

                              const disabled = isBooked || (locked && !mine);

                              const cls =
                                "seatBtn " +
                                (!isBooked && !locked && !isSelected ? "available " : "") +
                                (isBooked ? "booked " : "") +
                                (locked && !mine ? "locked " : "") +
                                (mine ? "mine " : "") +
                                (!mine && isSelected ? "selected " : "");

                              return (
                                <button
                                  key={seatId}
                                  type="button"
                                  className={cls}
                                  disabled={disabled}
                                  onClick={() => toggleSeat(seatId)}
                                  title={seatId}
                                >
                                  {c + 1}
                                </button>
                              );
                            })}
                          </div>

                          {aisleSize ? <div className="seatAisle" /> : null}

                          <div className="seatBlock">
                            {Array.from({ length: rightCols }).map((__, rc) => {
                              const c = leftCols + aisleSize + rc;
                              const seatId = seatLabel(r, c);

                              const isBooked = bookedSet.has(seatId);
                              const locked = !isBooked && isSeatLocked(seatId);
                              const mine = locked && isLockedByMe(seatId);
                              const isSelected = selected.includes(seatId);

                              const disabled = isBooked || (locked && !mine);

                              const cls =
                                "seatBtn " +
                                (!isBooked && !locked && !isSelected ? "available " : "") +
                                (isBooked ? "booked " : "") +
                                (locked && !mine ? "locked " : "") +
                                (mine ? "mine " : "") +
                                (!mine && isSelected ? "selected " : "");

                              return (
                                <button
                                  key={seatId}
                                  type="button"
                                  className={cls}
                                  disabled={disabled}
                                  onClick={() => toggleSeat(seatId)}
                                  title={seatId}
                                >
                                  {c + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY (mobile last) */}
          <div className="col-12 col-lg-4 order-2 order-lg-2">
            <div className="glass summaryCard">
              <div className="kicker">Summary</div>
              <div className="muted2">Review before confirming.</div>

              <div className="mt-3">
                <div className="muted2 small">Movie</div>
                <div className="fw-bold">{show?.movieId?.title || "—"}</div>
              </div>

              <div className="mt-3">
                <div className="muted2 small">Hall</div>
                <div className="fw-bold">{hall?.name || "—"}</div>
              </div>

              <div className="mt-3">
                <div className="muted2 small">Showtime</div>
                <div className="fw-bold">
                  {show?.startTime ? fmtDateTime(show.startTime) : "—"}
                </div>
              </div>

              <div className="seatChips">
                {selected.length ? (
                  selected.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="muted2">No seats selected.</span>
                )}
              </div>

              <div className="priceRow">
                <span>Tickets</span>
                <strong>{selectedCount}</strong>
              </div>
              <div className="priceRow">
                <span>Price / seat</span>
                <strong>LKR {price.toLocaleString()}</strong>
              </div>
              <div className="priceRow">
                <span>Total</span>
                <strong>LKR {total.toLocaleString()}</strong>
              </div>

              <button
                className="btn btn-success w-100 confirmBtn mt-3"
                disabled={busy || !selected.length}
                onClick={confirmBooking}
              >
                {busy ? "Booking..." : "Confirm Booking"}
              </button>

              <button
                className="btn btn-outline-light w-100 rounded-4 mt-2"
                disabled={busy}
                onClick={() => nav(-1)}
              >
                Back
              </button>

              <div className="muted2 small mt-3">
                Auto-exit after 15 minutes inactivity.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
