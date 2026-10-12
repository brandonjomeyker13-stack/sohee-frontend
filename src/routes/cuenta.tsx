import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, User as UserIcon, ShieldCheck, MapPin, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { changePassword, updateProfile, ApiError } from "@/lib/api";
import { Header } from "@/components/Header";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta | Sohee" },
      {
        name: "description",
        content:
          "Consulta tu correo, actualiza tus datos personales y cambia tu contraseña en Sohee.",
      },
      { property: "og:title", content: "Mi cuenta | Sohee" },
      {
        property: "og:description",
        content: "Gestiona tus datos personales y tu contraseña en Sohee.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState("");
  const [needsCurrent, setNeedsCurrent] = useState(false);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/cuenta" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAddress(user.address ?? "");
      setCity(user.city ?? "");
    }
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        email,
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
      });
      await refresh();
      toast.success("Datos actualizados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos actualizar tus datos");
    } finally {
      setSavingProfile(false);
    }
  };


  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("La nueva contraseña y su confirmación no coinciden");
      return;
    }
    setSavingPass(true);
    try {
      // Primero intentamos sin contraseña actual: si la cuenta no tiene (entró con
      // Google), el backend la define directamente. Solo si la exige, la pedimos.
      await changePassword(next, needsCurrent ? current : undefined);
      toast.success(needsCurrent ? "Contraseña actualizada" : "Contraseña definida");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 403) && !needsCurrent) {
        setNeedsCurrent(true);
        toast.error("Tu cuenta ya tiene contraseña: escribe la actual para poder cambiarla.");
      } else {
        toast.error(err instanceof Error ? err.message : "No pudimos cambiar la contraseña");
      }
    } finally {
      setSavingPass(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="mt-2 text-muted-foreground">
          Consulta tu información y gestiona tu seguridad.
        </p>

        {loading || !user ? (
          <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
        ) : (
          <div className="mt-8 space-y-6">
            {/* Resumen */}
            <section className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                  {user.name?.trim().charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{user.name}</p>
                  <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {user.email}
                  </p>
                </div>
                {user.is_admin && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Administrador
                  </span>
                )}
              </div>
            </section>

            {/* Datos personales */}
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-xl font-semibold">Datos personales</h2>
              <form onSubmit={saveProfile} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="acc-name">Nombre</Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="acc-name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      minLength={2}
                      required
                      className="pl-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="acc-email"
                      autoComplete="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-address">Dirección de entrega</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="acc-address"
                      autoComplete="street-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle 10 #4-56, Barrio Centro"
                      className="pl-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-city">Ciudad</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="acc-city"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Medellín"
                      className="pl-11"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </section>


            {/* Contraseña */}
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-xl font-semibold">Contraseña</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Usa al menos 8 caracteres.
                {needsCurrent
                  ? " Tu cuenta ya tiene contraseña, así que necesitamos la actual."
                  : " Si entraste con Google y aún no tienes contraseña, aquí puedes crearla."}
              </p>

              <form onSubmit={savePassword} className="mt-5 space-y-4">
                {[
                  ...(needsCurrent
                    ? [
                        {
                          id: "cur",
                          label: "Contraseña actual",
                          value: current,
                          set: setCurrent,
                          required: true,
                        },
                      ]
                    : []),
                  { id: "new", label: "Nueva contraseña", value: next, set: setNext, required: true },
                  {
                    id: "cfm",
                    label: "Confirmar nueva contraseña",
                    value: confirm,
                    set: setConfirm,
                    required: true,
                  },

                ].map((f) => (
                  <div key={f.id} className="space-y-2">
                    <Label htmlFor={`pwd-${f.id}`}>{f.label}</Label>
                    <PasswordInput
                      id={`pwd-${f.id}`}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder="••••••••"
                      required={f.required}
                      minLength={8}
                    />
                  </div>
                ))}
                <Button type="submit" disabled={savingPass}>
                  {savingPass ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
