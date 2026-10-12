import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  setToken,
  refreshAccessToken,
  setRefreshHandler,
  logoutRequest,
  type User,
  API_BASE,
} from "./api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, acceptedTerms?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, acceptedTerms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** id_token de Google de la sesión actual (para poder definir contraseña). */
  googleIdToken: string | null;
  /** Define la contraseña de una cuenta creada con Google. */
  setGooglePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const refreshingRef = useRef<Promise<string | null> | null>(null);
  const qc = useQueryClient();


  // Renovación de access token deduplicada (una sola petición concurrente).
  useEffect(() => {
    setRefreshHandler(() => {
      if (!refreshingRef.current) {
        refreshingRef.current = refreshAccessToken().finally(() => {
          refreshingRef.current = null;
        });
      }
      return refreshingRef.current;
    });
    return () => setRefreshHandler(null);
  }, []);

  const loadMe = async () => {
    try {
      const me = await api<User>("/auth/me", { auth: true });
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    }
  };

  const refresh = async () => {
    await loadMe();
    setLoading(false);
  };

  // Al arrancar: pide un access token nuevo con la cookie de refresh.
  useEffect(() => {
    void (async () => {
      const token = await refreshAccessToken();
      if (token) await loadMe();
      else setUser(null);
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      let detail = "";
      try {
        const d = await res.json();
        if (typeof d?.detail === "string") detail = d.detail;
      } catch {
        /* noop */
      }
      const low = detail.toLowerCase();
      const noAccount =
        res.status === 404 ||
        /no existe|no está registrad|no esta registrad|not found|no encontrad|sin cuenta/.test(low);
      if (noAccount) {
        throw new Error(`No existe ninguna cuenta con el correo ${email}. Regístrate para crearla.`);
      }
      throw new Error(detail || "La contraseña es incorrecta");
    }
    const data = (await res.json()) as { access_token: string };
    setToken(data.access_token);
    qc.clear(); // evita mezclar datos (carrito, pedidos) de otra sesión
    await refresh();
  };

  const googleAuth = async (idToken: string, password?: string, acceptedTerms = true) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_token: idToken,
        accepted_terms: acceptedTerms,
        ...(password ? { password } : {}),
      }),
    });
    if (!res.ok) {
      let msg = "No pudimos iniciar sesión con Google";
      try {
        const d = await res.json();
        if (typeof d?.detail === "string") msg = d.detail;
      } catch {
        /* noop */
      }
      throw new Error(msg);
    }
    const data = (await res.json()) as { access_token: string };
    setToken(data.access_token);
    qc.clear();
    await refresh();
  };

  const loginWithGoogle = async (idToken: string, acceptedTerms = true) => {
    await googleAuth(idToken, undefined, acceptedTerms);
    setGoogleIdToken(idToken);
  };

  const setGooglePassword = async (password: string) => {
    if (!googleIdToken) throw new Error("Vuelve a iniciar sesión con Google para definir tu contraseña");
    await googleAuth(googleIdToken, password);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    acceptedTerms: boolean,
  ) => {
    if (!acceptedTerms) {
      throw new Error("Debes aceptar los Términos y la Política de Datos para crear tu cuenta");
    }
    await api("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, accepted_terms: true }),
    });
    await login(email, password);
  };


  const logout = async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
    setGoogleIdToken(null);
    qc.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        refresh,
        googleIdToken,
        setGooglePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
