import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";

import Navbar from "./components/Navbar";

// User pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SeatBooking from "./pages/SeatBooking";
import MyBookings from "./pages/MyBookings";

// Admin layout + pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminMovies from "./admin/pages/Movies";
import AdminHalls from "./admin/pages/Halls";
import AdminShows from "./admin/pages/Shows";
import AdminBookings from "./admin/pages/Bookings";

function AppShell() {
  const location = useLocation();
  const path = location.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isAuthPage = path === "/login" || path === "/signup";

  return (
    <>
      {/* ✅ Show navbar only on normal user pages */}
      {!isAdminRoute && !isAuthPage && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/show/:id" element={<SeatBooking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Admin protected */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="halls" element={<AdminHalls />} />
            <Route path="shows" element={<AdminShows />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
