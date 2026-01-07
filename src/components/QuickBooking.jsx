import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

function fmtTime(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}

export default function QuickBooking({ movies = [] }) {
  const nav = useNavigate();

  const [movieId, setMovieId] = useState("");
  const [shows, setShows] = useState([]);
  const [showId, setShowId] = useState("");

  const [loadingShows, setLoadingShows] = useState(false);
  const [err, setErr] = useState("");

  const movieOptions = useMemo(() => {
    return (Array.isArray(movies) ? movies : []).map((m) => ({
      id: m?._id,
      title: m?.title || "Movie",
    }));
  }, [movies]);

  useEffect(() => {
    setShows([]);
    setShowId("");
    setErr("");

    if (!movieId) return;

    (async () => {
      setLoadingShows(true);
      try {
        const res = await http.get(`/shows/by-movie/${movieId}`);
        setShows(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load shows");
      } finally {
        setLoadingShows(false);
      }
    })();
  }, [movieId]);

  const selectedShow = useMemo(() => {
    return shows.find((s) => String(s?._id) === String(showId)) || null;
  }, [shows, showId]);

  function goBook() {
    if (!showId) return;
    // ✅ IMPORTANT: seat page route
    nav(`/show/${showId}`);
    // if your route is different, change to:
    // nav(`/seat-booking/${showId}`);
  }

  return (
    <div className="glass p-3 p-md-4">
      <style>{`
        .glass{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 18px 70px rgba(0,0,0,0.40);
        }
        .qbTitle{
          font-weight: 950;
          font-size: 18px;
          color: #fff;
        }
        .muted{ color: rgba(255,255,255,0.70); }
        .ctrl{
          border-radius: 14px !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          background: rgba(255,255,255,0.06) !important;
          color: #fff !important;
        }
        .ctrl:focus{
          box-shadow: 0 0 0 4px rgba(0,255,170,0.10) !important;
          border-color: rgba(0,255,170,0.35) !important;
        }
        .hint{
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <div className="qbTitle">⚡ Quick Booking</div>
          <div className="muted mt-1">
            Pick a movie → choose a showtime → book seats instantly.
          </div>
        </div>
        <span className="badge rounded-pill text-bg-success">LIVE</span>
      </div>

      {err ? <div className="alert alert-danger mt-3 mb-0">{err}</div> : null}

      <div className="row g-2 mt-3">
        <div className="col-12 col-md-6">
          <label className="hint mb-1">Movie</label>
          <select
            className="form-select ctrl"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
          >
            <option value="">Select a movie...</option>
            {movieOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="hint mb-1">Showtime</label>
          <select
            className="form-select ctrl"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            disabled={!movieId || loadingShows}
          >
            <option value="">
              {loadingShows ? "Loading shows..." : "Select a showtime..."}
            </option>
            {shows.map((s) => (
              <option key={s?._id} value={s?._id}>
                {fmtTime(s?.startTime)} • {s?.hallId?.name || "Hall"} • LKR{" "}
                {Number(s?.price || 0).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <div className="hint">
          {selectedShow ? (
            <>
              Selected: <b className="text-white">{selectedShow?.hallId?.name || "Hall"}</b>{" "}
              • {fmtTime(selectedShow?.startTime)}
            </>
          ) : (
            "Tip: Use Quick Booking for fastest seat selection."
          )}
        </div>

        <button
          className="btn btn-success px-4 fw-bold"
          onClick={goBook}
          disabled={!showId}
          style={{ borderRadius: 14 }}
        >
          Book Seats →
        </button>
      </div>
    </div>
  );
}
