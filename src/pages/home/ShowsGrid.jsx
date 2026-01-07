import React from "react";
import { Link } from "react-router-dom";

function fmtDateTime(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}

export default function ShowsGrid({ movie, shows = [], loading = false, error = "" }) {
  return (
    <section className="homeBlock" id="shows">
      <div className="homeBlock__head">
        <div>
          <div className="homeKicker">Showtimes</div>
          <h2 className="homeTitle">Available Shows</h2>
          <div className="homeMuted">
            {movie ? (
              <>
                Selected Movie: <b className="text-white">{movie.title}</b>
              </>
            ) : (
              "Select a movie to see showtimes."
            )}
          </div>
        </div>

        <span className="homePill">
          {movie ? (loading ? "Loading..." : `${shows.length} shows`) : "—"}
        </span>
      </div>

      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      {!movie ? (
        <div className="homeEmpty mt-3">
          🎬 Choose a movie above. Then showtimes (hall + time + price) will appear here.
        </div>
      ) : loading ? (
        <div className="homeMuted mt-3">Loading showtimes…</div>
      ) : shows.length === 0 ? (
        <div className="homeEmpty mt-3">No shows for this movie yet. (Admin can add shows)</div>
      ) : (
        <div className="showsGrid">
          {shows.map((s) => (
            <div key={s._id} className="showCard">
              <div className="showCard__top">
                <div className="showCard__time">{fmtDateTime(s.startTime)}</div>
                <span className="badge text-bg-success">LKR {s.price}</span>
              </div>

              <div className="homeMuted">Hall: {s?.hallId?.name || "—"}</div>

              <Link to={`/show/${s._id}`} className="btn btn-primary rounded-4 w-100 mt-3">
                Book Seats
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
