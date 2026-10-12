import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { PasswordInput } from "@/components/PasswordInput";
import { getGoogleClientId } from "@/lib/config.functions";
import { useSuspenseQuery } from "@tanstack/react-query";

const googleClientIdQueryOptions = {
  queryKey: ["googleClientId"],
  queryFn: () => getGoogleClientId(),
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/",
  }),
  head: () => ({
    meta: [
      { title: "Ingresa a tu cuenta | Sohee" },
      {
        name: "description",
        content: "Inicia sesión o crea tu cuenta en Sohee para comprar y seguir tus pedidos.",
      },
      { property: "og:title", content: "Ingresa a tu cuenta | Sohee" },
      {
        property: "og:description",
        content: "Inicia sesión o crea tu cuenta en Sohee.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(googleClientIdQueryOptions),
  component: AuthPage,
});

function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { data: clientId } = useSuspenseQuery(googleClientIdQueryOptions);
  const [mode, setMode] = useState<"login" | "register">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const needsAcceptance = mode === "register" && !accepted;

  const handleGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      // Continuar con Google implica aceptación explícita de los términos.
      await loginWithGoogle(idToken, true);

      toast.success("¡Bienvenido a Sohee!");
      navigate({ to: "/configurar-perfil", search: { redirect: redirect || "/" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsAcceptance) {
      toast.error("Debes aceptar los Términos y la Política de Datos para crear tu cuenta");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else {
        // El nombre real se pide en la configuración de perfil.
        const provisional = email.split("@")[0].slice(0, 100) || "Usuario";
        await register(provisional.length >= 2 ? provisional : "Usuario", email, password, accepted);
      }
      toast.success("¡Bienvenido a Sohee!");
      navigate({ to: "/configurar-perfil", search: { redirect: redirect || "/" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos completar la operación");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setEmail("");
    setPassword("");
    setAccepted(false);
  };


  return (
    <div className="gradient-mesh relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">


      <div className="w-full max-w-6xl">
        <div className="grid overflow-hidden rounded-3xl border bg-card shadow-2xl lg:grid-cols-2">
          {/* Brand panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-foreground" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary-foreground" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl font-bold">Sohee</span>
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <h2 className="font-display text-4xl font-semibold leading-tight">
                Tu tienda de bolsos y morrales
              </h2>
              <p className="max-w-sm text-lg text-primary-foreground/80">
                Descubre productos de calidad, compra con seguridad y recibe en la puerta de tu casa.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Productos premium</p>
                    <p className="text-sm text-primary-foreground/70">Bolsos y morrales de materiales duraderos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pagos seguros</p>
                    <p className="text-sm text-primary-foreground/70">Pagas al recibir</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/10">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Entrega confiable</p>
                    <p className="text-sm text-primary-foreground/70">Sigue tu pedido en tiempo real</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Sohee. Todos los derechos reservados.
            </p>
          </div>

          {/* Form panel */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="group -ml-2 rounded-full text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Volver a la tienda
                </Link>
              </Button>
            </div>

            <div className="mb-8 flex flex-col items-center gap-4 text-center lg:hidden">
              <h1 className="font-display text-2xl font-bold">Sohee</h1>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {mode === "login"
                  ? "Ingresa para continuar con tus compras y pedidos."
                  : "Regístrate en segundos y empieza a comprar."}
              </p>
            </div>

            {/* Mode switcher */}
            <div className="mb-8 flex rounded-full bg-muted p-1.5">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  mode === "register"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Registrarme
              </button>
            </div>

            {/* Google */}
            <div className="mb-4">
              <GoogleLoginButton
                clientId={clientId}
                onCredential={handleGoogle}
                text={mode === "login" ? "signin_with" : "signup_with"}
              />
            </div>

            <p className="mb-6 text-center text-xs leading-relaxed text-muted-foreground">
              Al continuar con Google aceptas de inmediato los{" "}
              <Link
                to="/terminos"
                target="_blank"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                to="/privacidad"
                target="_blank"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Política de Tratamiento de Datos Personales
              </Link>
              .
            </p>


            <div className="mb-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                o con tu correo
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>



            <form onSubmit={submit} className="space-y-5">


              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                {mode === "register" && (
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                )}
              </div>

              {mode === "register" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-muted/40 p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
                  />
                  <span className="text-muted-foreground">
                    He leído y acepto los{" "}
                    <Link
                      to="/terminos"
                      target="_blank"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link
                      to="/privacidad"
                      target="_blank"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Política de Tratamiento de Datos Personales
                    </Link>
                    .
                  </span>
                </label>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full shadow-lg shadow-primary/20"
                disabled={loading || needsAcceptance}
              >
                {loading ? "Procesando..." : mode === "login" ? "Ingresar a mi cuenta" : "Crear cuenta gratis"}
              </Button>

            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
