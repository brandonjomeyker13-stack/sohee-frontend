import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Package } from "lucide-react";
import { getOrders } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/OrderCard";

function isActive(status: string) {
  const s = status.toLowerCase();
  return ["pending", "confirmed", "shipped", "in_transit", "awaiting_confirmation"].includes(s);
}

function isCompleted(status: string) {
  const s = status.toLowerCase();
  return ["delivered", "completed"].includes(s);
}

function isCancelled(status: string) {
  const s = status.toLowerCase();
  return ["cancelled", "declined", "voided", "expired", "error"].includes(s);
}


export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Mis pedidos | Sohee" },
      {
        name: "description",
        content: "Sigue el estado de tus pedidos de Sohee hasta la entrega.",
      },
      { property: "og:title", content: "Mis pedidos | Sohee" },
      { property: "og:description", content: "Sigue el estado de tus pedidos hasta la entrega." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/pedidos" } });
  }, [loading, user, navigate]);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-4 font-display text-2xl font-extrabold">Mis pedidos</h1>

        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : error ? (
          <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            No pudimos cargar tus pedidos. Revisa tu conexión e inténtalo de nuevo.
          </p>
        ) : !orders || orders.length === 0 ? (
          <div className="card-surface grid place-items-center gap-3 p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Todavía no tienes pedidos.</p>
            <Button asChild>
              <Link to="/">Empezar a comprar</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.some((o) => isActive(o.status)) && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Pedidos en curso
                </h2>
                <ul className="space-y-4">
                  {orders
                    .filter((o) => isActive(o.status))
                    .map((o) => (
                      <OrderCard key={o.id} order={o} role="customer" />
                    ))}
                </ul>
              </section>
            )}

            {orders.some((o) => isCompleted(o.status)) && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Entregados y pagados
                </h2>
                <ul className="space-y-4">
                  {orders
                    .filter((o) => isCompleted(o.status))
                    .map((o) => (
                      <OrderCard key={o.id} order={o} role="customer" />
                    ))}
                </ul>
              </section>
            )}

            {orders.some((o) => isCancelled(o.status)) && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Cancelados o anulados
                </h2>
                <ul className="space-y-4">
                  {orders
                    .filter((o) => isCancelled(o.status))
                    .map((o) => (
                      <OrderCard key={o.id} order={o} role="customer" />
                    ))}
                </ul>
              </section>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
