import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const emptyForm = {
  title: "",
  genre: "",
  durationMins: "",
  description: "",
  posterUrl: "",
  isActive: true,
};

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // create form
  const [form, setForm] = useState(emptyForm);

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [edit, setEdit] = useState(null); // holds movie being edited

  async function load() {
    setLoading(true);
    try {
      // ✅ if backend has /movies/admin use this, otherwise change to "/movies"
      const res = await http.get("/movies/admin");
      setMovies(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load movies. Check admin token & API route.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function normalizePayload(src) {
    const payload = {
      title: (src.title || "").trim(),
      genre: (src.genre || "").trim(),
      durationMins: Number(src.durationMins),
      description: (src.description || "").trim(),
      posterUrl: (src.posterUrl || "").trim(),
      isActive: !!src.isActive,
    };

    if (!payload.title) throw new Error("Movie title is required.");
    if (!payload.durationMins || payload.durationMins < 1)
      throw new Error("Duration must be a positive number (e.g., 120).");

    return payload;
  }

  async function createMovie(e) {
    e.preventDefault();
    try {
      const payload = normalizePayload(form);
      await http.post("/movies", payload);
      setForm(emptyForm);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Create movie failed.");
    }
  }

  function openEditModal(movie) {
    setEdit({
      _id: movie._id,
      title: movie.title || "",
      genre: movie.genre || "",
      durationMins: movie.durationMins || "",
      description: movie.description || "",
      posterUrl: movie.posterUrl || "",
      isActive: !!movie.isActive,
    });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!edit?._id) return;
    setEditBusy(true);
    try {
      const payload = normalizePayload(edit);
      await http.put(`/movies/${edit._id}`, payload);
      setEditOpen(false);
      setEdit(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "Update failed.");
    } finally {
      setEditBusy(false);
    }
  }

  async function setActive(movieId, title, isActive) {
    const ok = window.confirm(
      `${isActive ? "Restore" : "Disable"} "${title}"?\n${
        isActive
          ? "This will make it visible to users again."
          : "This will hide it from users (soft disable)."
      }`
    );
    if (!ok) return;

    try {
      await http.put(`/movies/${movieId}`, { isActive: !!isActive });
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Action failed. Check permissions.");
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return movies;
    return movies.filter((m) =>
      [m.title, m.genre, m.description]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s))
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
        .admin-input::placeholder { color: rgba(255,255,255,0.70) !important; }
        .admin-modal-backdrop{
          position: fixed; inset: 0; background: rgba(0,0,0,.55);
          display:grid; place-items:center; z-index: 9999; padding: 16px;
        }
        .admin-modal{
          width: min(720px, 100%);
          border-radius: 18px;
          padding: 14px;
          background: rgba(10,12,18,0.92);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 30px 100px rgba(0,0,0,0.65);
          color: #fff;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Movies</h3>
          <div className="small admin-muted2">
            Create, update and control visibility of movies.
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
                onChange={(e) =>
                  setForm({ ...form, durationMins: e.target.value })
                }
              />

              <textarea
                className="form-control admin-input"
                style={inputStyle}
                rows={4}
                placeholder="Short description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Poster image URL (https://...)"
                value={form.posterUrl}
                onChange={(e) =>
                  setForm({ ...form, posterUrl: e.target.value })
                }
              />

              <div className="d-flex align-items-center justify-content-between mt-1 text-white">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    id="isActive"
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active (visible)
                  </label>
                </div>

                <button className="btn btn-success rounded-4" type="submit">
                  Create
                </button>
              </div>
            </form>

            {form.posterUrl?.trim() ? (
              <div className="mt-3 glass-soft p-2">
                <div
                  className="small"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
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
            ) : null}
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
              <table
                className="table admin-table align-middle m-0"
                style={{ background: "transparent" }}
              >
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
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                          </div>
                        </td>

                        <td style={{ minWidth: 240 }}>
                          <div className="fw-semibold text-white">{m.title}</div>
                          <div className="small admin-muted2">
                            {m.description?.slice(0, 64) || "—"}
                          </div>
                        </td>

                        <td className="text-white-50">{m.genre || "—"}</td>
                        <td className="text-white-50">
                          {m.durationMins} mins
                        </td>

                        <td>
                          <span className="admin-badge">
                            {m.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-light rounded-4"
                              onClick={() => openEditModal(m)}
                            >
                              Edit
                            </button>

                            {m.isActive ? (
                              <button
                                className="btn btn-sm btn-outline-danger rounded-4"
                                onClick={() => setActive(m._id, m.title, false)}
                              >
                                Disable
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-success rounded-4"
                                onClick={() => setActive(m._id, m.title, true)}
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && edit ? (
        <div
          className="admin-modal-backdrop"
          onClick={() => (editBusy ? null : setEditOpen(false))}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div className="fw-bold" style={{ fontSize: 18 }}>
                  Edit movie
                </div>
                <div className="small text-white-50">
                  Update details and visibility.
                </div>
              </div>
              <button
                className="btn btn-outline-light rounded-4"
                disabled={editBusy}
                onClick={() => setEditOpen(false)}
              >
                ✕
              </button>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.12)" }} />

            <form onSubmit={saveEdit} className="row g-2">
              <div className="col-12">
                <label className="small text-white-50 mb-1">Title</label>
                <input
                  className="form-control admin-input"
                  style={inputStyle}
                  value={edit.title}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="small text-white-50 mb-1">Genre</label>
                <input
                  className="form-control admin-input"
                  style={inputStyle}
                  value={edit.genre}
                  onChange={(e) => setEdit({ ...edit, genre: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="small text-white-50 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-control admin-input"
                  style={inputStyle}
                  value={edit.durationMins}
                  onChange={(e) =>
                    setEdit({ ...edit, durationMins: e.target.value })
                  }
                />
              </div>

              <div className="col-12">
                <label className="small text-white-50 mb-1">Description</label>
                <textarea
                  className="form-control admin-input"
                  style={inputStyle}
                  rows={4}
                  value={edit.description}
                  onChange={(e) =>
                    setEdit({ ...edit, description: e.target.value })
                  }
                />
              </div>

              <div className="col-12">
                <label className="small text-white-50 mb-1">Poster URL</label>
                <input
                  className="form-control admin-input"
                  style={inputStyle}
                  value={edit.posterUrl}
                  onChange={(e) =>
                    setEdit({ ...edit, posterUrl: e.target.value })
                  }
                />
              </div>

              <div className="col-12 d-flex align-items-center justify-content-between mt-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={edit.isActive}
                    onChange={(e) =>
                      setEdit({ ...edit, isActive: e.target.checked })
                    }
                    id="editIsActive"
                  />
                  <label className="form-check-label" htmlFor="editIsActive">
                    Active (visible)
                  </label>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-4"
                    disabled={editBusy}
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary rounded-4"
                    type="submit"
                    disabled={editBusy}
                  >
                    {editBusy ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>

              {edit.posterUrl?.trim() ? (
                <div className="col-12 mt-2">
                  <div className="small text-white-50">Poster preview</div>
                  <img
                    src={edit.posterUrl}
                    alt="poster"
                    className="img-fluid rounded-4 mt-2"
                    style={{ maxHeight: 240, width: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
