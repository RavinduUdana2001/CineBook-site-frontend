import React, { useMemo } from "react";

const FALLBACK_POSTER =
  "https://via.placeholder.com/1200x700.png?text=Movie+Poster";

function posterOf(m) {
  return m?.posterUrl || m?.poster || m?.imageUrl || m?.image || FALLBACK_POSTER;
}

export default function MoviesGrid({
  movies = [],
  selectedMovieId = "",
  onSelectMovie,
  search = "",
  onSearch,
  loading = false,
  error = "",
}) {
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return movies;
    return movies.filter((m) =>
      [m.title, m.genre].filter(Boolean).some((x) => x.toLowerCase().includes(s))
    );
  }, [movies, search]);

  return (
    <section className="homeBlock" id="movies">
      <style>{`
        .homeBlock{
          color:#fff;
          padding-bottom: 28px; /* ✅ space under section */
        }
        @media (max-width: 575.98px){
          .homeBlock{ padding-bottom: 46px; } /* ✅ extra bottom spacing on mobile */
        }

        .homeBlock__head{
          display:flex; justify-content:space-between; align-items:flex-end;
          gap:14px; flex-wrap:wrap;
          margin-bottom: 16px;
        }
        .homeKicker{
          font-size:12px;
          letter-spacing:.18em;
          text-transform:uppercase;
          color: rgba(255,255,255,0.60);
        }
        .homeTitle{
          margin:6px 0 0;
          font-weight: 950;
        }
        .homeMuted{ color: rgba(255,255,255,0.72); }

        .homeSearch{
          display:flex; align-items:center; gap:10px;
          padding:10px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          min-width: min(360px, 100%);
        }
        .homeSearch__icon{ opacity:.85; }
        .homeInput{
          background: transparent !important;
          border: 0 !important;
          color: #fff !important;
          padding: 0 !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .homeInput::placeholder{ color: rgba(255,255,255,0.65); }

        .moviesGrid{
          display:grid;
          gap: 14px; /* ✅ more spacing */
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-top: 10px;
        }
        @media (max-width: 991.98px){
          .moviesGrid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 575.98px){
          .moviesGrid{
            grid-template-columns: 1fr;
            gap: 16px;
            padding-bottom: 14px; /* ✅ extra space under last card */
          }
        }

        .movieCard{
          border: 0;
          padding: 0;
          background: transparent;
          text-align: left;
          border-radius: 18px;
          overflow: hidden;
          outline: 1px solid rgba(255,255,255,0.12);
          transition: transform .18s ease, outline .18s ease, box-shadow .18s ease;
        }
        .movieCard:hover{
          transform: translateY(-3px);
          box-shadow: 0 22px 60px rgba(0,0,0,0.42);
          outline: 1px solid rgba(255,255,255,0.20);
        }
        .movieCard.active{
          outline: 2px solid rgba(46, 204, 113, 0.60);
          box-shadow: 0 26px 70px rgba(0,0,0,0.52);
        }

        .movieCard__poster{
          position: relative;
          aspect-ratio: 16 / 10;
          background: rgba(255,255,255,0.06);
        }
        .movieCard__poster img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.03);
          transition: transform .35s ease;
        }
        .movieCard:hover .movieCard__poster img{
          transform: scale(1.06);
        }
        .movieCard__grad{
          position:absolute; inset:0;
          background: linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.88));
        }

        .movieBadge{
          position:absolute;
          top: 10px; left: 10px;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          color: rgba(255,255,255,0.92);
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
        }

        .movieCard__info{
          position:absolute;
          left: 12px; right: 12px; bottom: 12px;
        }
        .movieCard__title{
          font-weight: 950;
          font-size: 16px;
          color: #fff;
        }
        .movieCard__meta{
          margin-top: 2px;
          font-size: 13px;
          color: rgba(255,255,255,0.80);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .movieCard__cta{
          display:flex; align-items:center; justify-content:space-between;
          gap: 10px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .movieHint{ font-size: 13px; color: rgba(255,255,255,0.85); }
        .movieArrow{ font-size: 14px; color: rgba(255,255,255,0.92); transition: transform .18s ease; }
        .movieCard:hover .movieArrow{ transform: translateX(3px); }
      `}</style>

      <div className="homeBlock__head">
        <div>
          <div className="homeKicker">Now Showing</div>
          <h2 className="homeTitle">Movies</h2>
          <div className="homeMuted">Tap a movie to open showtimes.</div>
        </div>

        <div className="homeSearch">
          <span className="homeSearch__icon">🔎</span>
          <input
            className="form-control homeInput"
            placeholder="Search by title or genre..."
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      {loading ? (
        <div className="homeMuted mt-3">Loading movies…</div>
      ) : filtered.length === 0 ? (
        <div className="homeMuted mt-3">No movies found.</div>
      ) : (
        <div className="moviesGrid">
          {filtered.map((m) => {
            const active = selectedMovieId === m._id;
            return (
              <button
                key={m._id}
                type="button"
                className={`movieCard ${active ? "active" : ""}`}
                onClick={() => onSelectMovie?.(m)}
              >
                <div className="movieCard__poster">
                  <img
                    src={posterOf(m)}
                    alt={m.title}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = FALLBACK_POSTER)}
                  />
                  <div className="movieCard__grad" />
                  <div className="movieBadge">{active ? "Selected" : "Now Showing"}</div>

                  <div className="movieCard__info">
                    <div className="movieCard__title">{m.title}</div>
                    <div className="movieCard__meta">
                      <span>{m.genre || "—"}</span>
                      {m.durationMins ? <span> • {m.durationMins} mins</span> : null}
                    </div>
                    <div className="movieCard__cta">
                      <span className="movieHint">View showtimes</span>
                      <span className="movieArrow">→</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
