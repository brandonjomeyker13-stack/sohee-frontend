import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { getAllOrders } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
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


export const Route = createFileRoute("/admin/pedidos")({
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (error)
    return (
      <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        No pudimos cargar los pedidos. Revisa tu conexión e inténtalo de nuevo.
      </p>
    );

  if (!orders || orders.length === 0)
    return (
      <div className="card-surface grid place-items-center gap-3 p-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Aún no hay pedidos registrados.</p>
      </div>
    );

  return (
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
                <OrderCard key={o.id} order={o} role="admin" />
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
                <OrderCard key={o.id} order={o} role="admin" />
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
                <OrderCard key={o.id} order={o} role="admin" />
              ))}
          </ul>
        </section>
      )}
    </div>
  );

}
