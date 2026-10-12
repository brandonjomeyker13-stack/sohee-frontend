import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar Google")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Google"));
    document.head.appendChild(s);
  });
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleLoginButton({
  clientId,
  onCredential,
  text = "continue_with",
}: {
  clientId: string;
  onCredential: (idToken: string) => void | Promise<void>;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || typeof window === "undefined" || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res: { credential?: string }) => {
            if (res?.credential) void cbRef.current(res.credential);
          },
        });
        setReady(true);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Error con Google"));
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    text === "signup_with"
      ? "Registrarme con Google"
      : text === "signin_with"
        ? "Iniciar sesión con Google"
        : "Continuar con Google";

  const handleClick = () => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: try to re-render a native button in a hidden container and click it
        const hidden = document.createElement("div");
        hidden.style.position = "fixed";
        hidden.style.opacity = "0";
        hidden.style.pointerEvents = "none";
        hidden.style.zIndex = "-1";
        document.body.appendChild(hidden);
        window.google.accounts.id.renderButton(hidden, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          width: 240,
        });
        const btn = hidden.querySelector("div[role='button']") as HTMLElement | null;
        btn?.click();
        setTimeout(() => hidden.remove(), 2000);
      }
    });
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full rounded-full border border-border bg-background font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        onClick={handleClick}
        disabled={!ready}
      >
        <GoogleIcon className="mr-3 h-5 w-5" />
        {label}
      </Button>
      {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}
