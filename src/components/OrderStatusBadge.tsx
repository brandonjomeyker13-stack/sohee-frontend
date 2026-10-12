const MAP: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "bg-accent text-accent-foreground" },
  confirmed: {
    label: "Confirmado — coordinando entrega",
    className: "bg-accent text-accent-foreground",
  },
  in_transit: { label: "En camino", className: "bg-primary/25 text-secondary" },
  shipped: { label: "En camino", className: "bg-primary/25 text-secondary" },
  awaiting_confirmation: {
    label: "Confirma que lo recibiste",
    className: "bg-accent text-accent-foreground",
  },
  delivered: { label: "Entregado", className: "bg-success/15 text-success" },
  completed: { label: "Entregado", className: "bg-success/15 text-success" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
  declined: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
  voided: { label: "Anulado", className: "bg-destructive/10 text-destructive" },
  expired: { label: "Expirado", className: "bg-muted text-muted-foreground" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const info = MAP[status?.toLowerCase()] ?? {
    label: "En proceso",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${info.className}`}>
      {info.label}
    </span>
  );
}
