import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminRoute() {
  const { user, isAuthed, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
