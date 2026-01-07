import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function AdminShows() {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [filterMovieId, setFilterMovieId] = useState("");

  const [form, setForm] = useState({
    movieId: "",
    hallId: "",
    startTime: "",
    price: "",
  });

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    borderRadius: 12,
  };

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, hRes] = await Promise.all([http.get("/movies/admin"), http.get("/halls")]);
      const m = Array.isArray(mRes.data) ? mRes.data : [];
      const h = Array.isArray(hRes.data) ? hRes.data : [];

      setMovies(m);
      setHalls(h);

      const firstMovie = m.find((x) => x.isActive !== false) || m[0];
      const firstHall = h[0];

      setForm((prev) => ({
        ...prev,
        movieId: prev.movieId || firstMovie?._id || "",
        hallId: prev.hallId || firstHall?._id || "",
      }));

      if (firstMovie?._id) {
        await loadShowsByMovie(firstMovie._id);
        setFilterMovieId(firstMovie._id);
      } else {
        setShows([]);
        setFilterMovieId("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load movies/halls. Please check admin token/API.");
    } finally {
      setLoading(false);
    }
  }

  async function loadShowsByMovie(movieId) {
    if (!movieId) return setShows([]);
    const res = await http.get(`/shows/by-movie/${movieId}`);
    setShows(Array.isArray(res.data) ? res.data : []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createShow(e) {
    e.preventDefault();

    const payload = {
      movieId: form.movieId,
      hallId: form.hallId,
      startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
      price: Number(form.price),
    };

    if (!payload.movieId) return alert("Please select a movie.");
    if (!payload.hallId) return alert("Please select a hall.");
    if (!payload.startTime) return alert("Please select a start date/time.");
    if (!payload.price || payload.price < 1) return alert("Ticket price must be at least 1.");

    setCreating(true);
    try {
      await http.post("/shows", payload);
      setForm((p) => ({ ...p, startTime: "", price: "" }));

      const mId = filterMovieId || payload.movieId;
      setFilterMovieId(mId);
      await loadShowsByMovie(mId);

      alert("Show created successfully.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Create show failed.");
    } finally {
      setCreating(false);
    }
  }

  const activeMovies = useMemo(() => movies.filter((m) => m.isActive !== false), [movies]);

  const filteredShows = useMemo(() => shows, [shows]);

  return (
    <div style={{ background: "transparent" }}>
      <style>{`
        .admin-input::placeholder { color: rgba(255,255,255,0.85) !important; }
        select.admin-input option { color: #111; }
      `}</style>

      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Shows</h3>
          <div className="small admin-muted2">
            Create schedules by linking a movie, hall, start time, and ticket price.
          </div>
        </div>

        <button className="btn btn-outline-light rounded-4" onClick={loadAll} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="row g-3">
        {/* Create show */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-3">
            <div className="fw-semibold mb-2 text-white">Create show</div>

            <form onSubmit={createShow} className="d-flex flex-column gap-2">
              <select
                className="form-control admin-input"
                style={inputStyle}
                value={form.movieId}
                onChange={(e) => setForm({ ...form, movieId: e.target.value })}
              >
                {movies.length === 0 ? (
                  <option value="">No movies available</option>
                ) : (
                  movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} {m.isActive === false ? "(Inactive)" : ""}
                    </option>
                  ))
                )}
              </select>

              <select
                className="form-control admin-input"
                style={inputStyle}
                value={form.hallId}
                onChange={(e) => setForm({ ...form, hallId: e.target.value })}
              >
                {halls.length === 0 ? (
                  <option value="">No halls available</option>
                ) : (
                  halls.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.rows}×{h.cols})
                    </option>
                  ))
                )}
              </select>

              <input
                type="datetime-local"
                className="form-control admin-input"
                style={inputStyle}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />

              <input
                type="number"
                min="1"
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Ticket price (LKR)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <button className="btn btn-success rounded-4 mt-1" disabled={creating || loading}>
                {creating ? "Creating..." : "Create Show"}
              </button>

              <div className="small admin-muted2 mt-2">
                Only active movies should be scheduled for booking.
              </div>
            </form>
          </div>
        </div>

        {/* Shows list */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-3">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-2">
              <div className="fw-semibold text-white">Shows list</div>

              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 w-md-auto">
                <div className="small text-white-50">Filter movie:</div>

                <select
                  className="form-control admin-input w-100"
                  style={inputStyle}
                  value={filterMovieId}
                  onChange={async (e) => {
                    const id = e.target.value;
                    setFilterMovieId(id);
                    if (id) await loadShowsByMovie(id);
                    else setShows([]);
                  }}
                >
                  <option value="">— Select a movie —</option>
                  {activeMovies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>

                <span className="admin-badge">{filteredShows.length} shows</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle m-0" style={{ background: "transparent" }}>
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>Hall</th>
                    <th className="text-end">Price</th>
                  </tr>
                </thead>

                <tbody style={{ background: "transparent" }}>
                  {loading && (
                    <tr>
                      <td colSpan={3} className="text-center text-white-50 py-4">
                        Loading shows...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredShows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-white-50 py-4">
                        No shows available for the selected movie.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredShows.map((s) => (
                      <tr key={s._id} style={{ background: "transparent" }}>
                        <td className="text-white">
                          {s.startTime ? new Date(s.startTime).toLocaleString() : "—"}
                        </td>
                        <td className="text-white-50">{s.hallId?.name || "—"}</td>
                        <td className="text-end text-white-50">LKR {s.price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="small admin-muted2 mt-2">
              Shows appear on the client side under each movie and use showId for seat booking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
