import { MapPin, Phone, User } from "lucide-react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { OrderPayButton } from "@/components/OrderPayButton";
import { formatCOP, orderCustomer } from "@/lib/api";
import type { Order } from "@/lib/api";

/** Muestra el color legible: "NEGRO" -> "Negro". */
function colorLabel(value: string) {
  const v = value.replace(/_/g, " ").toLowerCase();
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export function OrderCard({ order, role }: { order: Order; role: "customer" | "admin" }) {
  const cerradoPorTienda = order.closed_by === "SELLER";
  const customer = role === "admin" ? orderCustomer(order) : null;
  const place = [customer?.address, customer?.city].filter(Boolean).join(", ");

  return (
    <li
      className={`card-surface p-5 ${
        role === "admin" && cerradoPorTienda ? "border-l-4 border-l-destructive" : ""
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">Pedido #{order.id}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleString("es-CO")} · Ref {order.reference}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {role === "admin" && (
        <div className="mt-3 space-y-1.5 rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">
              {customer?.name || `Cliente #${customer?.id ?? order.user_id ?? "—"}`}
            </span>
          </p>
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0">{place || "Sin dirección registrada"}</span>
          </p>
          {customer?.phone && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${customer.phone}`} className="hover:underline">
                {customer.phone}
              </a>
            </p>
          )}
        </div>
      )}

      <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between gap-3">
            <span className="truncate capitalize">
              {it.product_name}
              {it.color ? ` — ${colorLabel(it.color)}` : ""} × {it.quantity}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {formatCOP(it.unit_price * it.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t pt-3 text-right text-lg font-semibold">
        Total {formatCOP(order.total_amount)}
      </p>
      {order.payment_method && (
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {order.payment_method === "NEQUI" ? "Nequi al recibir" : "Efectivo al recibir"}
        </p>
      )}
      {role === "customer" && <OrderPayButton order={order} />}
      <OrderConfirmation order={order} role={role} />

    </li>
  );
}
