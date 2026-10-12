import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User as UserIcon, MapPin, Lock, ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { updateProfile, changePassword, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordInput } from "@/components/PasswordInput";

export const Route = createFileRoute("/configurar-perfil")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/",
  }),
  head: () => ({
    meta: [
      { title: "Configura tu perfil | Sohee" },
      {
        name: "description",
        content:
          "Completa tu nombre, dirección de entrega y contraseña para empezar a comprar en Sohee.",
      },
      { property: "og:title", content: "Configura tu perfil | Sohee" },
      {
        property: "og:description",
        content: "Completa tus datos de entrega para empezar a comprar en Sohee.",
      },
    ],
  }),
  component: SetupProfilePage,
});

function SetupProfilePage() {
  const { user, loading, refresh, googleIdToken } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Perfil incompleto = falta nombre, dirección o ciudad.
  const profileIncomplete = !user?.name || !user?.address || !user?.city;
  // Solo pedimos contraseña si entró con Google y la cuenta aún está sin configurar.
  const needsPassword = !!googleIdToken && profileIncomplete;
  const isComplete = !profileIncomplete && !needsPassword;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/configurar-perfil" } });
      return;
    }
    if (isComplete) {
      navigate({ to: redirect || "/" });
    }
  }, [loading, user, isComplete, navigate, redirect]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setAddress(user.address ?? "");
    setCity(user.city ?? "");
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (needsPassword && password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), address: address.trim(), city: city.trim() });
      if (needsPassword && password) {
        try {
          await changePassword(password);
        } catch (err) {
          // Si la cuenta ya tenía contraseña, el backend la exige: no bloqueamos el onboarding.
          if (!(err instanceof ApiError && err.status === 400)) throw err;
        }
      }
      await refresh();
      toast.success("¡Perfil listo!");
      navigate({ to: redirect || "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos guardar tu perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl sm:p-10">
        {loading || !user ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <UserIcon className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Configura tu perfil
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Necesitamos estos datos para preparar y entregar tus pedidos.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5" autoComplete="off">
              <Field
                id="setup-name"
                label="Nombre completo"
                icon={<UserIcon className="h-4 w-4" />}
                value={name}
                onChange={setName}
                placeholder="Juan Pérez"
                required
                minLength={2}
                autoComplete="name"
              />
              <Field
                id="setup-address"
                label="Dirección de entrega"
                icon={<MapPin className="h-4 w-4" />}
                value={address}
                onChange={setAddress}
                placeholder="Calle 10 #4-56, Barrio Centro"
                required
                minLength={5}
                autoComplete="street-address"
              />
              <Field
                id="setup-city"
                label="Ciudad"
                icon={<Building2 className="h-4 w-4" />}
                value={city}
                onChange={setCity}
                placeholder="Medellín"
                required
                minLength={2}
                autoComplete="address-level2"
                inputMode="text"
              />




              {needsPassword && (
                <div className="space-y-5 rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    Entraste con Google. Define una contraseña para poder ingresar también con tu
                    correo.
                  </p>
                  <Field
                    id="setup-pass"
                    label="Contraseña"
                    icon={<Lock className="h-4 w-4" />}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    type="password"
                    required
                    minLength={8}
                  />
                  <Field
                    id="setup-pass2"
                    label="Confirmar contraseña"
                    icon={<Lock className="h-4 w-4" />}
                    value={confirm}
                    onChange={setConfirm}
                    placeholder="••••••••"
                    type="password"
                    required
                    minLength={8}
                  />
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                {saving ? "Guardando..." : "Guardar y continuar"}
                {!saving && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "id">) {
  const isPassword = rest.type === "password";
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {!isPassword && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        {isPassword ? (
          <PasswordInput
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...rest}
          />
        ) : (
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-11"
            {...rest}
          />
        )}
      </div>
    </div>
  );
}
