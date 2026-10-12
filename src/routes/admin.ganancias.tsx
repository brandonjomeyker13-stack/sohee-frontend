import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, Coins, Package, Receipt, TrendingUp } from "lucide-react";
import {
  formatCOP,
  getDailySales,
  getMonthlySales,
  getTotalSales,
  getWeeklySales,
  type SalesPeriod,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/ganancias")({
  component: AdminSales,
});

type Range = "daily" | "weekly" | "monthly";

const ranges: { key: Range; label: string }[] = [
  { key: "daily", label: "Diario" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensual" },
];

const fetchers: Record<Range, () => Promise<SalesPeriod[]>> = {
  daily: getDailySales,
  weekly: getWeeklySales,
  monthly: getMonthlySales,
};

function formatPeriod(iso: string, range: Range) {
  const d = new Date(iso);
  if (range === "monthly")
    return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  if (range === "weekly")
    return `Semana del ${d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}`;
  return d.toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" });
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p
        className={`mt-2 font-display text-2xl font-extrabold ${accent ? "text-secondary" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function AdminSales() {
  const [range, setRange] = useState<Range>("daily");

  const total = useQuery({ queryKey: ["sales-total"], queryFn: getTotalSales });
  const series = useQuery({
    queryKey: ["sales", range],
    queryFn: fetchers[range],
  });

  const maxRevenue = Math.max(1, ...(series.data?.map((p) => p.revenue) ?? [1]));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen histórico
        </h2>
        {total.isLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : total.error ? (
          <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            No pudimos cargar el resumen de ventas.
          </p>
        ) : total.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Receipt} label="Ventas" value={formatCOP(total.data.revenue)} />
              <Stat icon={Coins} label="Costo" value={formatCOP(total.data.cost)} />
              <Stat icon={TrendingUp} label="Ganancia" value={formatCOP(total.data.profit)} accent />
              <Stat
                icon={Package}
                label="Unidades vendidas"
                value={`${total.data.items_sold} · ${total.data.orders_count} pedidos`}
              />
            </div>
            {total.data.items_without_cost > 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {total.data.items_without_cost} unidad(es) vendidas no tenían costo registrado, así
                que la ganancia mostrada está por encima de la real. Agrega el costo en cada
                producto para tener cifras exactas.
              </p>
            )}
          </>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Desglose por periodo
          </h2>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {ranges.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  range === r.key
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {series.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : series.error ? (
          <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            No pudimos cargar el detalle de ventas.
          </p>
        ) : !series.data?.length ? (
          <div className="card-surface grid place-items-center gap-3 p-12 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Todavía no hay ventas en este periodo.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {[...series.data]
              .sort((a, b) => +new Date(b.period) - +new Date(a.period))
              .map((p) => (
                <li key={p.period} className="card-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium capitalize">{formatPeriod(p.period, range)}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.orders_count} pedido(s) · {p.items_sold} unidad(es)
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                      <p className="font-semibold">{formatCOP(p.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Costo</p>
                      <p className="font-semibold">{formatCOP(p.cost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ganancia</p>
                      <p className="font-semibold text-secondary">{formatCOP(p.profit)}</p>
                    </div>
                  </div>
                  {p.items_without_cost > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      {p.items_without_cost} unidad(es) sin costo cargado en este periodo.
                    </p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
