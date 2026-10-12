import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de administración | Sohee" },
      {
        name: "description",
        content: "Gestiona productos, imágenes, stock y pedidos de la tienda Sohee.",
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="font-display text-2xl font-extrabold">Panel del administrador</h1>
        <nav className="-mx-4 mt-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:gap-2 sm:px-0">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
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
