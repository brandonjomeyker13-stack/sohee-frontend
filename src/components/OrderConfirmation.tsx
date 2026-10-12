import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Clock, Handshake, Truck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { confirmDelivery, updateOrderStatus, type Order } from "@/lib/api";

function fecha(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

/** Días completos que lleva el pedido esperando la confirmación de la clienta. */
function diasEsperando(order: Order) {
  const base = new Date(order.delivered_at ?? order.created_at).getTime();
  if (!Number.isFinite(base)) return 0;
  return Math.max(0, Math.floor((Date.now() - base) / (24 * 60 * 60 * 1000)));
}

export function OrderConfirmation({ order, role }: { order: Order; role: "customer" | "admin" }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const status = (order.status ?? "").toUpperCase();
  const confirmado = status === "CONFIRMED";
  const enCamino = status === "IN_TRANSIT";
  const esperando = status === "AWAITING_CONFIRMATION";
  const entregado = status === "DELIVERED" || status === "COMPLETED";
  const cancelado = ["CANCELLED", "DECLINED", "VOIDED", "EXPIRED", "ERROR"].includes(status);
  const cerroTienda = order.closed_by === "SELLER";
  const cerroClienta = order.closed_by === "CUSTOMER";
  const fechaCierre = fecha(order.delivery_confirmed_at ?? order.delivered_at);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      invalidate();
      toast.success(ok);
    } catch {
      toast.error("No pudimos actualizar el pedido. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (cancelado) return null;

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {/* --- Cliente --- */}
      {role === "customer" && esperando && (
        <div className="space-y-2 rounded-xl bg-accent/60 p-3">
          <p className="text-sm">
            La tienda marcó este pedido como entregado. Confírmalo para cerrarlo.
          </p>
          <Button
            size="lg"
            className="w-full"
            disabled={busy}
            onClick={() =>
              run(() => confirmDelivery(order.id), "¡Gracias! Tu pedido quedó cerrado.")
            }
          >
            <CheckCircle2 className="h-5 w-5" />
            Sí, recibí mi pedido y ya pagué
          </Button>
        </div>
      )}

      {role === "customer" && entregado && cerroClienta && (
        <p className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success">
          <Handshake className="h-4 w-4 shrink-0" />
          Confirmaste la entrega el {fechaCierre}
        </p>
      )}

      {role === "customer" && entregado && cerroTienda && (
        <p className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            La tienda cerró este pedido el {fechaCierre}. Si algo no está bien, escríbenos.
          </span>
        </p>
      )}

      {role === "customer" && (confirmado || enCamino) && (
        <p className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          {enCamino ? (
            <Truck className="h-4 w-4 shrink-0" />
          ) : (
            <Clock className="h-4 w-4 shrink-0" />
          )}
          {enCamino
            ? "Tu pedido va en camino. Pagas cuando lo recibas."
            : "Nos comunicamos contigo para coordinar la entrega."}
        </p>
      )}

      {/* --- Dueña --- */}
      {role === "admin" && confirmado && (
        <Button
          size="sm"
          className="rounded-full"
          disabled={busy}
          onClick={() => run(() => updateOrderStatus(order.id, "IN_TRANSIT"), "Pedido en camino")}
        >
          <Truck className="h-4 w-4" />
          Salí a entregar
        </Button>
      )}

      {role === "admin" && enCamino && (
        <ConfirmDialog
          trigger={
            <Button size="sm" className="rounded-full" disabled={busy}>
              <CheckCircle2 className="h-4 w-4" />
              Entregué y me pagaron
            </Button>
          }
          title="¿Confirmas que entregaste el pedido y que te pagaron?"
          description="Con esto la venta queda registrada."
          confirmLabel="Sí, ya me pagaron"
          cancelLabel="No, volver"
          destructive={false}
          onConfirm={() =>
            run(
              () => updateOrderStatus(order.id, "AWAITING_CONFIRMATION"),
              "Venta registrada · esperando a la clienta",
            )
          }
        />
      )}

      {role === "admin" && esperando && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            Esperando confirmación hace {diasEsperando(order)} día(s)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline" className="rounded-full" disabled={busy}>
                  Cerrar pedido
                </Button>
              }
              title="¿Cerrar este pedido sin la clienta?"
              description="Quedará registrado que lo cerró la tienda."
              confirmLabel="Sí, cerrar pedido"
              cancelLabel="No, esperar"
              destructive={false}
              onConfirm={() => run(() => updateOrderStatus(order.id, "DELIVERED"), "Pedido cerrado")}
            />
            <p className="text-xs text-muted-foreground">
              La clienta todavía no ha confirmado. Ciérralo solo si estás segura de que recibió el
              pedido.
            </p>
          </div>
        </div>
      )}

      {role === "admin" && entregado && (
        <p
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            cerroTienda ? "bg-accent text-accent-foreground" : "bg-success/10 text-success"
          }`}
        >
          {cerroTienda ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <Handshake className="h-4 w-4 shrink-0" />
          )}
          {cerroTienda
            ? `Cerrado por la tienda el ${fechaCierre} · sin confirmación de la clienta`
            : cerroClienta
              ? `La clienta confirmó la entrega el ${fechaCierre}`
              : "Pedido entregado"}
        </p>
      )}
    </div>
  );
}
