import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    genre: "",
    durationMins: "",
    description: "",
    posterUrl: "",
    isActive: true,
  });

  async function load() {
    setLoading(true);
    try {
      const res = await http.get("/movies/admin");
      setMovies(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load movies. Please check admin token/API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createMovie(e) {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      genre: form.genre.trim(),
      durationMins: Number(form.durationMins),
      description: form.description.trim(),
      posterUrl: form.posterUrl.trim(),
      isActive: !!form.isActive,
    };

    if (!payload.title) return alert("Movie title is required.");
    if (!payload.durationMins || payload.durationMins < 1)
      return alert("Duration must be a positive number (example: 120).");

    try {
      await http.post("/movies", payload);
      setForm({
        title: "",
        genre: "",
        durationMins: "",
        description: "",
        posterUrl: "",
        isActive: true,
      });
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Create movie failed.");
    }
  }

  async function deleteMovie(movieId, title) {
    const ok = window.confirm(`Delete "${title}"?\nThis will mark it inactive (soft delete).`);
    if (!ok) return;

    try {
      await http.delete(`/movies/${movieId}`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Delete failed. Please check backend route permissions.");
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return movies;
    return movies.filter((m) =>
      [m.title, m.genre, m.description]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(s))
    );
  }, [movies, q]);

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    borderRadius: 12,
  };

  return (
    <div style={{ background: "transparent" }}>
      <style>{`
        .admin-input::placeholder { color: rgba(255,255,255,0.85) !important; }
      `}</style>

      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Movies</h3>
          <div className="small admin-muted2">
            Manage movie catalog and control what is visible to users.
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
          <input
            className="form-control admin-input w-100"
            style={inputStyle}
            placeholder="Search by title, genre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button
            className="btn btn-outline-light rounded-4"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* Create */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-3">
            <div className="fw-semibold mb-2 text-white">Create movie</div>

            <form onSubmit={createMovie} className="d-flex flex-column gap-2">
              <input
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Title (required)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Genre (e.g., Action, Romance)"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />

              <input
                type="number"
                min="1"
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Duration (minutes) e.g., 120"
                value={form.durationMins}
                onChange={(e) => setForm({ ...form, durationMins: e.target.value })}
              />

              <textarea
                className="form-control admin-input"
                style={inputStyle}
                rows={4}
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <input
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Poster image URL (https://...)"
                value={form.posterUrl}
                onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
              />

              <div className="d-flex align-items-center justify-content-between mt-1 text-white">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    id="isActive"
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active (visible to users)
                  </label>
                </div>

                <button className="btn btn-success rounded-4" type="submit">
                  Create
                </button>
              </div>
            </form>

            {form.posterUrl?.trim() && (
              <div className="mt-3 glass-soft p-2">
                <div className="small" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Poster preview
                </div>
                <img
                  src={form.posterUrl}
                  alt="poster"
                  className="img-fluid rounded-4 mt-2"
                  style={{ maxHeight: 220, width: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="fw-semibold text-white">Movie list</div>
              <span className="admin-badge">{filtered.length} movies</span>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle m-0" style={{ background: "transparent" }}>
                <thead>
                  <tr>
                    <th style={{ width: 72 }}>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody style={{ background: "transparent" }}>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="text-center text-white-50 py-4">
                        Loading movies...
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-white-50 py-4">
                        No movies found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((m) => (
                      <tr key={m._id} style={{ background: "transparent" }}>
                        <td>
                          <div
                            className="rounded-3"
                            style={{
                              width: 56,
                              height: 56,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              overflow: "hidden",
                            }}
                          >
                            {m.posterUrl ? (
                              <img
                                src={m.posterUrl}
                                alt={m.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                          </div>
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div className="fw-semibold text-white">{m.title}</div>
                          <div className="small admin-muted2">
                            {m.description?.slice(0, 64) || "—"}
                          </div>
                        </td>

                        <td className="text-white-50">{m.genre || "—"}</td>
                        <td className="text-white-50">{m.durationMins} mins</td>

                        <td>
                          <span className="admin-badge">{m.isActive ? "Active" : "Inactive"}</span>
                        </td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger rounded-4"
                            onClick={() => deleteMovie(m._id, m.title)}
                          >
                            Disable
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
