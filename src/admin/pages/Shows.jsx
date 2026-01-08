import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const emptyForm = { movieId: "", hallId: "", startTime: "", price: "" };

export default function AdminShows() {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [filterMovieId, setFilterMovieId] = useState("");

  const [form, setForm] = useState(emptyForm);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [edit, setEdit] = useState(null);

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    borderRadius: 12,
  };

  function toDatetimeLocalValue(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, hRes] = await Promise.all([
        http.get("/movies/admin"),
        http.get("/halls"),
      ]);
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
        setFilterMovieId(firstMovie._id);
        await loadShowsByMovie(firstMovie._id);
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
    if (!payload.price || payload.price < 1)
      return alert("Ticket price must be at least 1.");

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

  const activeMovies = useMemo(
    () => movies.filter((m) => m.isActive !== false),
    [movies]
  );

  const filteredShows = useMemo(() => shows, [shows]);

  function openEditModal(show) {
    // show.hallId may be populated object OR string, same for movieId
    const movieId =
      typeof show.movieId === "string" ? show.movieId : show.movieId?._id;
    const hallId =
      typeof show.hallId === "string" ? show.hallId : show.hallId?._id;

    setEdit({
      _id: show._id,
      movieId: movieId || "",
      hallId: hallId || "",
      startTime: toDatetimeLocalValue(show.startTime),
      price: show.price ?? "",
    });
    setEditOpen(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!edit?._id) return;

    const payload = {
      movieId: edit.movieId,
      hallId: edit.hallId,
      startTime: edit.startTime ? new Date(edit.startTime).toISOString() : null,
      price: Number(edit.price),
    };

    if (!payload.movieId) return alert("Please select a movie.");
    if (!payload.hallId) return alert("Please select a hall.");
    if (!payload.startTime) return alert("Please select a start date/time.");
    if (!payload.price || payload.price < 1)
      return alert("Ticket price must be at least 1.");

    setEditBusy(true);
    try {
      await http.put(`/shows/${edit._id}`, payload);

      // if movie changed, move list to that movie
      const mId = payload.movieId || filterMovieId;
      setFilterMovieId(mId);
      await loadShowsByMovie(mId);

      setEditOpen(false);
      setEdit(null);

      alert("Show updated successfully.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Update show failed.");
    } finally {
      setEditBusy(false);
    }
  }

  async function deleteShow(showId, startTime, hallName) {
    const ok = window.confirm(
      `Delete this show?\n\nStart: ${startTime}\nHall: ${hallName}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    try {
      await http.delete(`/shows/${showId}`);
      if (filterMovieId) await loadShowsByMovie(filterMovieId);
      else setShows((prev) => prev.filter((x) => x._id !== showId));
      alert("Show deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  }

  return (
    <div style={{ background: "transparent" }}>
      <style>{`
        .admin-input::placeholder { color: rgba(255,255,255,0.75) !important; }
        select.admin-input option { color: #111; }
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

      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Shows</h3>
          <div className="small admin-muted2">
            Create schedules by linking a movie, hall, start time, and ticket price.
          </div>
        </div>

        <button
          className="btn btn-outline-light rounded-4"
          onClick={loadAll}
          disabled={loading}
        >
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

              <button
                className="btn btn-success rounded-4 mt-1"
                disabled={creating || loading}
              >
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
              <table
                className="table admin-table align-middle m-0"
                style={{ background: "transparent" }}
              >
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>Hall</th>
                    <th className="text-end">Price</th>
                    <th className="text-end" style={{ width: 190 }}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody style={{ background: "transparent" }}>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="text-center text-white-50 py-4">
                        Loading shows...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredShows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-white-50 py-4">
                        No shows available for the selected movie.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredShows.map((s) => {
                      const startText = s.startTime
                        ? new Date(s.startTime).toLocaleString()
                        : "—";
                      const hallName = s.hallId?.name || "—";

                      return (
                        <tr key={s._id} style={{ background: "transparent" }}>
                          <td className="text-white">{startText}</td>
                          <td className="text-white-50">{hallName}</td>
                          <td className="text-end text-white-50">LKR {s.price}</td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                              <button
                                className="btn btn-sm btn-outline-light rounded-4"
                                onClick={() => openEditModal(s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-4"
                                onClick={() => deleteShow(s._id, startText, hallName)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="small admin-muted2 mt-2">
              Shows appear on the client side under each movie and use showId for seat booking.
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
                  Edit show
                </div>
                <div className="small text-white-50">
                  Update schedule details (be careful if users already booked seats).
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

            <form onSubmit={saveEdit} className="d-flex flex-column gap-2">
              <label className="small text-white-50">Movie</label>
              <select
                className="form-control admin-input"
                style={inputStyle}
                value={edit.movieId}
                onChange={(e) => setEdit({ ...edit, movieId: e.target.value })}
              >
                {activeMovies.length === 0 ? (
                  <option value="">No active movies</option>
                ) : (
                  activeMovies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))
                )}
              </select>

              <label className="small text-white-50 mt-1">Hall</label>
              <select
                className="form-control admin-input"
                style={inputStyle}
                value={edit.hallId}
                onChange={(e) => setEdit({ ...edit, hallId: e.target.value })}
              >
                {halls.length === 0 ? (
                  <option value="">No halls</option>
                ) : (
                  halls.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.rows}×{h.cols})
                    </option>
                  ))
                )}
              </select>

              <label className="small text-white-50 mt-1">Start time</label>
              <input
                type="datetime-local"
                className="form-control admin-input"
                style={inputStyle}
                value={edit.startTime}
                onChange={(e) => setEdit({ ...edit, startTime: e.target.value })}
              />

              <label className="small text-white-50 mt-1">Price (LKR)</label>
              <input
                type="number"
                min="1"
                className="form-control admin-input"
                style={inputStyle}
                value={edit.price}
                onChange={(e) => setEdit({ ...edit, price: e.target.value })}
              />

              <div className="d-flex justify-content-end gap-2 mt-3">
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
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
