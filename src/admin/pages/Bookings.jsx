import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const safeArr = (x) => (Array.isArray(x) ? x : []);

function fmtDate(x) {
  try {
    return new Date(x).toLocaleString();
  } catch {
    return "—";
  }
}

function fmtMoney(n) {
  const num = Number(n || 0);
  return `LKR ${num.toLocaleString()}`;
}

function getUserName(b) {
  // supports different field names if your User model is different
  return (
    b?.userId?.name ||
    b?.userId?.fullName ||
    b?.userId?.username ||
    ""
  );
}

function getUserEmail(b) {
  return b?.userId?.email || b?.email || "";
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await http.get("/bookings");
      setBookings(safeArr(res.data));
    } catch (e) {
      console.error(e);
      alert("Failed to load bookings. Please check admin token/API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const inputStyle = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff",
    borderRadius: 12,
  };

  const filtered = useMemo(() => {
    let list = bookings;

    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() : null;

    if (from) list = list.filter((b) => new Date(b.createdAt).getTime() >= from);
    if (to) list = list.filter((b) => new Date(b.createdAt).getTime() <= to);

    const s = q.trim().toLowerCase();
    if (!s) return list;

    return list.filter((b) => {
      const movieTitle = b?.showId?.movieId?.title || "";
      const hallName = b?.showId?.hallId?.name || "";
      const userName = getUserName(b) || "";
      const userEmail = getUserEmail(b) || "";
      const seats = (b?.seats || b?.seatNumbers || []).join(", ");

      return [movieTitle, hallName, userName, userEmail, seats]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(s));
    });
  }, [bookings, q, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalBookings = filtered.length;

    const totalSeats = filtered.reduce((sum, b) => {
      const seats = b?.seats || b?.seatNumbers || [];
      return sum + (Array.isArray(seats) ? seats.length : 0);
    }, 0);

    // Use backend booking.total when present; fallback to seats×price
    const totalRevenue = filtered.reduce((sum, b) => {
      if (b?.total != null) return sum + Number(b.total || 0);
      const seats = b?.seats || b?.seatNumbers || [];
      const seatCount = Array.isArray(seats) ? seats.length : 0;
      const price = Number(b?.showId?.price || 0);
      return sum + seatCount * price;
    }, 0);

    return { totalBookings, totalSeats, totalRevenue };
  }, [filtered]);

  return (
    <div style={{ background: "transparent" }}>
      <style>{`
        .admin-input::placeholder { color: rgba(255,255,255,0.85) !important; }

        .cust-wrap{
          display:flex;
          flex-direction:column;
          line-height:1.15;
        }
        .cust-name{
          font-weight:700;
          color:#fff;
        }
        .cust-email{
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          word-break: break-word;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Bookings</h3>
          <div className="small admin-muted2">
            Review all bookings, seat allocations, and revenue totals.
          </div>
        </div>

        <button className="btn btn-outline-light rounded-4" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters + Summary */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="glass-card p-3">
            <div className="fw-semibold text-white mb-2">Filters</div>

            <div className="row g-2">
              <div className="col-12 col-md-6">
                <input
                  className="form-control admin-input"
                  style={inputStyle}
                  placeholder="Search by movie, hall, user name/email, or seat (e.g., A1)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-3">
                <input
                  type="datetime-local"
                  className="form-control admin-input"
                  style={inputStyle}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <div className="small text-white-50 mt-1">From</div>
              </div>

              <div className="col-12 col-md-3">
                <input
                  type="datetime-local"
                  className="form-control admin-input"
                  style={inputStyle}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <div className="small text-white-50 mt-1">To</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="glass-card p-3 h-100">
            <div className="fw-semibold text-white mb-2">Summary</div>

            <div className="d-flex justify-content-between text-white-50">
              <span>Total bookings</span>
              <span className="text-white">{stats.totalBookings}</span>
            </div>

            <div className="d-flex justify-content-between text-white-50 mt-2">
              <span>Total seats</span>
              <span className="text-white">{stats.totalSeats}</span>
            </div>

            <div className="d-flex justify-content-between text-white-50 mt-2">
              <span>Total revenue</span>
              <span className="text-white">{fmtMoney(stats.totalRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <div className="fw-semibold text-white">All bookings</div>
          <span className="admin-badge">{filtered.length} records</span>
        </div>

        <div className="table-responsive">
          <table className="table admin-table align-middle m-0" style={{ background: "transparent" }}>
            <thead>
              <tr>
                <th>Booked At</th>
                <th>Customer</th>
                <th>Movie</th>
                <th>Hall</th>
                <th>Show Time</th>
                <th>Seats</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>

            <tbody style={{ background: "transparent" }}>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center text-white-50 py-4">
                    Loading bookings...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-white-50 py-4">
                    No bookings match the selected filters.
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((b) => {
                  const seats = b?.seats || b?.seatNumbers || [];
                  const seatCount = Array.isArray(seats) ? seats.length : 0;
                  const price = Number(b?.showId?.price || 0);

                  const computedAmount = seatCount * price;
                  const total = b?.total != null ? Number(b.total || 0) : computedAmount;

                  const userName = getUserName(b);
                  const userEmail = getUserEmail(b);

                  return (
                    <tr key={b._id} style={{ background: "transparent" }}>
                      <td className="text-white-50">{fmtDate(b.createdAt)}</td>

                      {/* ✅ CUSTOMER NAME + EMAIL */}
                      <td className="text-white" style={{ minWidth: 220 }}>
                        <div className="cust-wrap">
                          <span className="cust-name">{userName || "—"}</span>
                          <span className="cust-email">{userEmail || "—"}</span>
                        </div>
                      </td>

                      <td className="text-white">{b?.showId?.movieId?.title || "—"}</td>

                      <td className="text-white-50">{b?.showId?.hallId?.name || "—"}</td>

                      <td className="text-white-50">{fmtDate(b?.showId?.startTime)}</td>

                      <td className="text-white-50">
                        {Array.isArray(seats) && seats.length ? seats.join(", ") : "—"}
                      </td>

                      <td className="text-end text-white">
                        {fmtMoney(total)}
                        {b?.total == null && (
                          <div className="small text-white-50">
                            {seatCount} × {price}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
