import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import http from "../api/http";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // build user from token on refresh
  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    const decoded = decodeToken(token);

    // token invalid or expired
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
      setAuthReady(true);
      return;
    }

    setUser({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });
    setAuthReady(true);
  }, [token]);

  // ✅ LOGIN
  const login = async (email, password) => {
    const res = await http.post("/auth/login", { email, password });

    const newToken = res.data?.token;
    if (!newToken) throw new Error("No token returned from server");

    localStorage.setItem("token", newToken);
    setToken(newToken);

    const decoded = decodeToken(newToken);
    const u = {
      id: decoded?.id,
      email: decoded?.email,
      role: decoded?.role,
      name: decoded?.name,
    };
    setUser(u);
    return u;
  };

  // ✅ SIGNUP (THIS FIXES YOUR ERROR)
  const signup = async (name, email, password) => {
    const res = await http.post("/auth/register", { name, email, password });

    // Your backend returns token + user (from the code you showed)
    const newToken = res.data?.token;

    // If your backend ever returns only {id,email} then this will be missing
    // So we force backend to return token (recommended)
    if (!newToken) {
      throw new Error("Register succeeded but no token returned. Check /auth/register response.");
    }

    localStorage.setItem("token", newToken);
    setToken(newToken);

    const decoded = decodeToken(newToken);
    const u = {
      id: decoded?.id,
      email: decoded?.email,
      role: decoded?.role,
      name: decoded?.name,
    };
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authReady,
      isAuthed: !!token,
      login,
      signup, // ✅ IMPORTANT
      logout,
    }),
    [token, user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
