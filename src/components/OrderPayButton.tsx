import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cancelOrder, payExistingOrder, wompiCheckoutUrl, type Order } from "@/lib/api";

/**
 * Pago en línea temporalmente desactivado: los pedidos se pagan al recibir.
 * El código se conserva para reactivarlo más adelante.
 */
const PAGO_EN_LINEA_ACTIVO = false;

export function OrderPayButton({ order }: { order: Order }) {
  const [busy, setBusy] = useState<"pay" | "cancel" | null>(null);
  const qc = useQueryClient();
  const status = (order.status ?? "").toUpperCase();
  const cancelable = status === "CONFIRMED";

  const pay = async () => {
    setBusy("pay");
    try {
      const res = await payExistingOrder(order.id);
      window.location.href = wompiCheckoutUrl(res, `${window.location.origin}/pedidos`);
    } catch {
      toast.error("No pudimos abrir el pago. Revisa tu conexión e inténtalo de nuevo.");
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy("cancel");
    try {
      await cancelOrder(order.id);
      await qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido cancelado");
    } catch {
      toast.error("No pudimos cancelar el pedido. Inténtalo de nuevo en un momento.");
    } finally {
      setBusy(null);
    }
  };

  if (!PAGO_EN_LINEA_ACTIVO && !cancelable) return null;

  return (
    <div className="mt-3 space-y-2">
      {PAGO_EN_LINEA_ACTIVO && (
        <Button className="w-full" size="lg" onClick={pay} disabled={busy !== null}>
          <CreditCard className="mr-2 h-4 w-4" />
          {busy === "pay" ? "Abriendo el pago..." : "Pagar ahora"}
        </Button>
      )}
      {cancelable && (
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={busy !== null}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {busy === "cancel" ? "Cancelando..." : "Cancelar pedido"}
            </Button>
          }
          title={`¿Cancelar el pedido #${order.id}?`}
          description="El pedido quedará cancelado. Si cambias de opinión, tendrás que hacerlo de nuevo desde el carrito."
          confirmLabel="Sí, cancelar pedido"
          cancelLabel="No, volver"
          onConfirm={cancel}
        />
      )}
    </div>
  );
}
