import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingBag, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  checkout,
  formatCOP,
  getCart,
  getProducts,
  removeCartItem,
  updateCartItem,
  type CheckoutResponse,
  type PaymentMethod,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { NoImage } from "@/components/NoImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Tu carrito | Sohee" },
      {
        name: "description",
        content: "Revisa los productos de tu carrito y confirma tu pedido con pago al recibir.",
      },
      { property: "og:title", content: "Tu carrito | Sohee" },
      { property: "og:description", content: "Revisa tu carrito y confirma tu pedido." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [done, setDone] = useState<{ order: CheckoutResponse; total: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/carrito" } });
  }, [loading, user, navigate]);

  const { data: cart, isLoading } = useQuery({ queryKey: ["cart"], queryFn: getCart, enabled: !!user });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });

  const rows = (cart ?? []).map((item) => ({
    item,
    product: products?.find((p) => p.id === item.product_id),
  }));
  const total = rows.reduce((a, r) => a + Number(r.product?.price ?? 0) * r.item.quantity, 0);

  const mutate = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: ["cart"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar el carrito");
    }
  };

  const pay = async () => {
    setPaying(true);
    try {
      const res = await checkout(method);
      const totalPagar = total;
      await qc.invalidateQueries({ queryKey: ["cart"] });
      await qc.invalidateQueries({ queryKey: ["orders"] });
      setDone({ order: res, total: totalPagar });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No pudimos confirmar tu pedido. Inténtalo de nuevo.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-xl px-4 py-10">
          <div className="card-surface space-y-4 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="font-display text-2xl font-extrabold">Pedido confirmado</h1>
            <p className="text-muted-foreground">
              ¡Listo! Tu pedido quedó confirmado. Te contactamos para coordinar la entrega y pagas
              cuando lo recibas.
            </p>
            <div className="space-y-1 rounded-xl bg-muted px-4 py-3 text-sm">
              <p>
                <span className="text-muted-foreground">Total a pagar: </span>
                <span className="font-semibold">{formatCOP(done.total)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Referencia: </span>
                <span className="font-semibold">{done.order.reference}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/pedidos">Ver mis pedidos</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Seguir comprando</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-4 font-display text-2xl font-extrabold">Tu carrito</h1>

        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <div className="card-surface grid place-items-center gap-3 p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
            <Button asChild>
              <Link to="/">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-3">
              {rows.map(({ item, product }) => (
                <li key={item.id} className="card-surface flex items-center gap-3 p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product?.image_url || product?.images?.[0]?.image_url ? (
                      <img
                        src={product.image_url || product.images![0]!.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <NoImage compact />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium capitalize">{product?.name ?? `Producto #${item.product_id}`}</p>
                    {(() => {
                      const c = (product?.colors ?? []).find((x) => x.value === item.color);
                      const label = c?.label ?? item.color;
                      return label ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {c && (
                            <span
                              style={{ backgroundColor: c.hex }}
                              className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
                            />
                          )}
                          <span className="truncate">{label}</span>
                        </p>
                      ) : null;
                    })()}
                    {product?.material && (
                      <p className="truncate text-sm text-muted-foreground">{product.material}</p>
                    )}
                    <p className="font-semibold">{formatCOP(Number(product?.price ?? 0) * item.quantity)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        item.quantity > 1
                          ? mutate(() => updateCartItem(item.id, item.quantity - 1))
                          : mutate(() => removeCartItem(item.id))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => mutate(() => updateCartItem(item.id, item.quantity + 1))}
                    >

                      <Plus className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Quitar del carrito">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                      title="¿Quitar este producto del carrito?"
                      description={product?.name ? `Se eliminará "${product.name}" de tu carrito.` : undefined}
                      confirmLabel="Sí, quitar"
                      onConfirm={() => mutate(() => removeCartItem(item.id))}
                    />

                  </div>
                </li>
              ))}
            </ul>

            <aside className="card-surface h-fit space-y-4 p-5">
              <h2 className="font-display text-lg font-bold">Resumen</h2>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Productos</span>
                <span>{rows.reduce((a, r) => a + r.item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
              <fieldset className="space-y-2 border-t pt-3">
                <legend className="mb-2 text-sm font-medium">¿Cómo quieres pagar?</legend>
                {(
                  [
                    { value: "CASH", label: "Efectivo al recibir" },
                    { value: "NEQUI", label: "Nequi al recibir" },
                  ] as { value: PaymentMethod; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                      method === opt.value ? "border-foreground bg-muted" : "hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={opt.value}
                      checked={method === opt.value}
                      onChange={() => setMethod(opt.value)}
                      className="h-4 w-4 accent-current"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
                <p className="text-xs text-muted-foreground">
                  Pagas cuando recibas el pedido. Nos comunicamos contigo para coordinar la entrega.
                </p>
              </fieldset>
              <Button className="w-full" size="lg" onClick={pay} disabled={paying}>
                {paying ? "Confirmando..." : "Confirmar pedido"}
              </Button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
