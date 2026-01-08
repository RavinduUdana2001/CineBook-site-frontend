import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";

function MovieCard({ movie, onClick }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div className="card h-100" style={{ cursor: "pointer" }} onClick={() => onClick(movie)}>
        <img
          src={movie.posterUrl || "https://via.placeholder.com/600x900?text=Movie"}
          className="card-img-top"
          alt={movie.title}
          style={{ aspectRatio: "2/3", objectFit: "cover" }}
        />
        <div className="card-body">
          <div className="fw-bold">{movie.title}</div>
          <div className="text-muted small">
            {movie.genre || "—"} • {movie.durationMins || 0} mins
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopPicksAll() {
  const nav = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/movies/top-picks", { params: { limit: 100 } });
        setMovies(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load top picks.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openMovie(movie) {
    nav(`/movie/${movie._id}`); // change if you don't have details route
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h3 className="mb-0">Top Picks</h3>
          <div className="text-muted small">All movies in this section</div>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => nav(-1)}>
          ← Back
        </button>
      </div>

      {err ? <div className="alert alert-danger">{err}</div> : null}
      {loading ? <div className="text-muted">Loading...</div> : null}

      {!loading && !movies.length ? <div className="text-muted">No movies available.</div> : null}

      <div className="row">
        {movies.map((m) => (
          <MovieCard key={m._id} movie={m} onClick={openMovie} />
        ))}
      </div>
    </div>
  );
}
