import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de administración | Sohee" },
      {
        name: "description",
        content: "Gestiona productos, imágenes, disponibilidad y pedidos de la tienda Sohee.",
      },
      { property: "og:title", content: "Panel de administración | Sohee" },
      { property: "og:description", content: "Gestiona productos y pedidos de Sohee." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", search: { redirect: "/admin" } });
    else if (!user.is_admin) navigate({ to: "/" });
  }, [user, loading, navigate]);

  if (loading || !user?.is_admin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-10 text-center text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  const tabs = [
    { to: "/admin/productos", label: "Productos" },
    { to: "/admin", label: "Nuevo producto" },
    { to: "/admin/categorias", label: "Categorías" },
    { to: "/admin/pedidos", label: "Pedidos recibidos" },
    { to: "/admin/ganancias", label: "Ganancias" },
  ] as const;

  const current = tabs.find((t) => t.to === pathname) ?? tabs[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="font-display text-2xl font-extrabold">Panel del administrador</h1>

        <div className="mt-4 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 w-full justify-between font-medium">
                {current.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
              {tabs.map((t) => (
                <DropdownMenuItem key={t.to} asChild>
                  <Link to={t.to} className={pathname === t.to ? "font-semibold" : ""}>
                    {t.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="mt-4 hidden flex-wrap gap-2 border-b md:flex" aria-label="Secciones del panel">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                pathname === t.to
                  ? "border-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
