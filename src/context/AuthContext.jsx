import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, removeToken, saveToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const login = async ({ email, password }) => {
    const data = await api.login(email, password);
    if (data.token) saveToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async ({ email, password }) => {
    const data = await api.register(email, password);
    if (data.token) saveToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isCheckingAuth, isAuthenticated: Boolean(user), login, register, logout }),
    [user, isCheckingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth musi być użyty wewnątrz AuthProvider");
  return value;
};
