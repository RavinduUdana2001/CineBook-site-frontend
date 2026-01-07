import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function AdminHalls() {
  const [halls, setHalls] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    rows: "",
    cols: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await http.get("/halls");
      setHalls(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load halls. Please check admin token/API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createHall(e) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      rows: Number(form.rows),
      cols: Number(form.cols),
    };

    if (!payload.name) return alert("Hall name is required.");
    if (!payload.rows || payload.rows < 1) return alert("Rows must be at least 1.");
    if (!payload.cols || payload.cols < 1) return alert("Columns must be at least 1.");

    try {
      await http.post("/halls", payload);
      setForm({ name: "", rows: "", cols: "" });
      await load();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Create hall failed.");
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return halls;
    return halls.filter((h) => (h.name || "").toLowerCase().includes(s));
  }, [halls, q]);

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
          <h3 className="m-0 text-white">Halls</h3>
          <div className="small admin-muted2">
            Create halls and define the seating layout used by shows.
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
          <input
            className="form-control admin-input w-100"
            style={inputStyle}
            placeholder="Search by hall name..."
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
            <div className="fw-semibold mb-2 text-white">Create hall</div>

            <form onSubmit={createHall} className="d-flex flex-column gap-2">
              <input
                className="form-control admin-input"
                style={inputStyle}
                placeholder="Hall name (e.g., Hall 1)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="row g-2">
                <div className="col-6">
                  <input
                    type="number"
                    min="1"
                    className="form-control admin-input"
                    style={inputStyle}
                    placeholder="Rows"
                    value={form.rows}
                    onChange={(e) => setForm({ ...form, rows: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    min="1"
                    className="form-control admin-input"
                    style={inputStyle}
                    placeholder="Columns"
                    value={form.cols}
                    onChange={(e) => setForm({ ...form, cols: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-2">
                <div className="small admin-muted2">Seat layout preview</div>
                <div
                  className="rounded-4 p-2 mt-2"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    maxHeight: 180,
                    overflow: "auto",
                  }}
                >
                  <SeatPreview rows={Number(form.rows)} cols={Number(form.cols)} />
                </div>
              </div>

              <button className="btn btn-success rounded-4 mt-2" type="submit">
                Create Hall
              </button>

              <div className="small admin-muted2 mt-2">
                Keep the layout consistent to match the seat map shown to users.
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="fw-semibold text-white">Halls list</div>
              <span className="admin-badge">{filtered.length} halls</span>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle m-0" style={{ background: "transparent" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rows</th>
                    <th>Cols</th>
                    <th>Total Seats</th>
                  </tr>
                </thead>

                <tbody style={{ background: "transparent" }}>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="text-center text-white-50 py-4">
                        Loading halls...
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-white-50 py-4">
                        No halls found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((h) => (
                      <tr key={h._id} style={{ background: "transparent" }}>
                        <td className="fw-semibold text-white">{h.name}</td>
                        <td className="text-white-50">{h.rows}</td>
                        <td className="text-white-50">{h.cols}</td>
                        <td className="text-white-50">{Number(h.rows) * Number(h.cols)}</td>
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

function SeatPreview({ rows, cols }) {
  const safeRows = Number.isFinite(rows) && rows > 0 ? Math.min(rows, 20) : 0;
  const safeCols = Number.isFinite(cols) && cols > 0 ? Math.min(cols, 20) : 0;

  if (!safeRows || !safeCols) {
    return <div className="text-white-50 small">Enter rows and columns to preview seats.</div>;
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="d-flex flex-column gap-1">
      {Array.from({ length: safeRows }).map((_, r) => (
        <div key={r} className="d-flex align-items-center gap-1">
          <div className="small text-white-50" style={{ width: 18, textAlign: "right" }}>
            {letters[r] || "?"}
          </div>

          {Array.from({ length: safeCols }).map((_, c) => (
            <div
              key={c}
              title={`${letters[r] || "?"}${c + 1}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
