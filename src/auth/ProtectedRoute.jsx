import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { isAuthed, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null; // or loader

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
