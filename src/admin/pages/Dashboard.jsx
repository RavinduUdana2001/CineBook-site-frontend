import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

function StatCard({ title, value, subtitle, badge = "LIVE" }) {
  return (
    <div className="glass-card p-3 h-100">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div style={{ minWidth: 0 }}>
          <div className="fw-semibold text-white">{title}</div>
          <div className="display-6 fw-bold mt-2 text-white">{value}</div>
          <div className="small mt-2 admin-muted2">{subtitle}</div>
        </div>
        <span className="admin-badge flex-shrink-0">{badge}</span>
      </div>
    </div>
  );
}

const safeArr = (x) => (Array.isArray(x) ? x : []);

export default function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showsCount, setShowsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [mRes, hRes, bRes] = await Promise.all([
        http.get("/movies/admin"),
        http.get("/halls"),
        http.get("/bookings"),
      ]);

      const m = safeArr(mRes.data);
      const h = safeArr(hRes.data);
      const b = safeArr(bRes.data);

      setMovies(m);
      setHalls(h);
      setBookings(b);

      const activeMovies = m.filter((x) => x?.isActive !== false);

      if (activeMovies.length === 0) {
        setShowsCount(0);
      } else {
        const showLists = await Promise.all(
          activeMovies.map((mv) =>
            http
              .get(`/shows/by-movie/${mv._id}`)
              .then((r) => safeArr(r.data))
              .catch(() => [])
          )
        );
        const totalShows = showLists.reduce((sum, list) => sum + list.length, 0);
        setShowsCount(totalShows);
      }
    } catch (e) {
      console.error(e);
      setError(
        e?.response?.data?.message ||
          `Failed to load dashboard data (${e?.response?.status || "?"})`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeMoviesCount = useMemo(
    () => movies.filter((x) => x?.isActive !== false).length,
    [movies]
  );

  const totalSeatsBooked = useMemo(() => {
    return bookings.reduce((sum, bk) => {
      const seats = bk?.seats || bk?.seatNumbers || [];
      return sum + (Array.isArray(seats) ? seats.length : 0);
    }, 0);
  }, [bookings]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, bk) => sum + Number(bk?.total || 0), 0);
  }, [bookings]);

  const totalCapacity = useMemo(() => {
    return halls.reduce((sum, h) => {
      const rows = Number(h?.rows || 0);
      const cols = Number(h?.cols || 0);
      return sum + rows * cols;
    }, 0);
  }, [halls]);

  const systemBadge = error ? "WARN" : "OK";

  return (
    <div>
      {/* Page section header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="m-0 text-white">Overview</h3>
          <div className="small admin-muted2">
            A real-time summary of system content and performance.
          </div>
        </div>

        <button
          className="btn btn-outline-light rounded-4"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? <div className="alert alert-danger mb-3">{error}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Movies"
            value={loading ? "—" : movies.length}
            subtitle={
              loading
                ? "Loading..."
                : `${activeMoviesCount} active • ${movies.length - activeMoviesCount} inactive`
            }
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Halls"
            value={loading ? "—" : halls.length}
            subtitle={loading ? "Loading..." : `Capacity: ${totalCapacity} seats`}
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Shows"
            value={loading ? "—" : showsCount}
            subtitle="Total schedules created (active movies)"
          />
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Bookings"
            value={loading ? "—" : bookings.length}
            subtitle={
              loading
                ? "Loading..."
                : `${totalSeatsBooked} seats booked • LKR ${totalRevenue}`
            }
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="glass-card p-3">
            <div className="fw-semibold mb-2 text-white">Admin workflow</div>
            <div className="small admin-muted2">
              Recommended order:
              <div className="mt-2 d-flex flex-wrap gap-2">
                <span className="admin-badge">Movies</span>
                <span className="admin-badge">Halls</span>
                <span className="admin-badge">Shows</span>
                <span className="admin-badge">Seat Booking Test</span>
              </div>
              <div className="mt-2">
                Use “Bookings” to verify revenue and seat allocations.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <StatCard
            title="System Status"
            value={error ? "Attention" : "Operational"}
            subtitle={error ? "Check API routes / token access." : "API and sockets are running."}
            badge={systemBadge}
          />
        </div>
      </div>
    </div>
  );
}
