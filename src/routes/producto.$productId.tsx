import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImageOff, Minus, Plus, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { addToCart, formatCOP, getCart, getProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/producto/$productId")({
  head: () => ({
    meta: [
      { title: "Detalle del producto | Sohee" },
      {
        name: "description",
        content: "Consulta precio, medidas, material y disponibilidad de este bolso o morral Sohee.",
      },
      { property: "og:title", content: "Detalle del producto | Sohee" },
      {
        property: "og:description",
        content: "Precio, medidas, material y disponibilidad en Sohee.",
      },
    ],
  }),
  component: ProductPage,
});

/** Muestra un número sin decimales inútiles: 43.0 -> "43", 43.5 -> "43,5". */
function num(v: number | string | null | undefined) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

function ProductPage() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [active, setActive] = useState(0);
  const [color, setColor] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: getCart, enabled: !!user });
  const colors = product?.colors ?? [];
  const hasColors = colors.length > 0;
  const selected = color ?? colors[0]?.value ?? null;
  const selectedColor = colors.find((c) => c.value === selected) ?? null;
  const selectedLabel = selectedColor?.label ?? null;

  const inCart = (cart ?? [])
    .filter(
      (i) =>
        i.product_id === Number(productId) && (!hasColors || (i.color ?? null) === selected),
    )
    .reduce((a, i) => a + i.quantity, 0);
  // Todo se trabaja por pedido: no hay límite de unidades.
  const remaining = 99;


  const gallery = (() => {
    const imgs = (product?.images ?? []).slice().sort((a, b) => a.position - b.position);
    const visible = selected ? imgs.filter((i) => !i.color || i.color === selected) : imgs;
    const urls = visible.map((i) => i.image_url);
    if (product?.image_url && !urls.includes(product.image_url) && !selected)
      urls.unshift(product.image_url);
    if (!urls.length && product?.image_url) urls.push(product.image_url);
    return urls;
  })();
  const current = gallery[Math.min(active, Math.max(gallery.length - 1, 0))];


  const handleAdd = async () => {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/producto/${productId}` } });
      return;
    }
    if (!product?.in_stock) {
      toast.error("Este producto no se puede pedir por ahora");
      return;
    }
    if (hasColors && !selected) {
      toast.error("Elige un color antes de agregar al carrito");
      return;
    }
    setAdding(true);
    try {
      await addToCart(
        Number(productId),
        Math.max(1, Math.min(qty, remaining)),
        hasColors ? selected : null,
      );
      await qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Producto agregado al carrito");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo agregar");
    } finally {
      setAdding(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>

        {isLoading || !product ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : (
          <div className="card-surface grid gap-6 p-4 md:grid-cols-2 md:p-6">
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {current ? (
                  <img
                    key={current}
                    src={current}
                    alt={`${product.name} — imagen ${Math.min(active, gallery.length - 1) + 1} de ${gallery.length}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageOff className="h-10 w-10" />
                  </div>
                )}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Imagen anterior"
                      onClick={() => setActive((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Imagen siguiente"
                      onClick={() => setActive((i) => (i + 1) % gallery.length)}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Ver imagen ${i + 1}`}
                      aria-current={i === active}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                        i === active ? "border-foreground" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>


            <div className="flex min-w-0 flex-col">
              {colors.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium">
                    Color{selectedLabel ? `: ${selectedLabel}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {colors.map((c) => {
                      const on = c.value === selected;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setColor(c.value);
                            setQty(1);
                            setActive(0);
                          }}
                          className="flex w-16 flex-col items-center gap-1 text-center"
                        >
                          <span
                            style={{ backgroundColor: c.hex }}
                            className={`h-9 w-9 rounded-full border transition ${
                              on
                                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-transparent"
                                : "border-border"
                            }`}
                          />
                          <span className="text-[11px] leading-tight text-muted-foreground">
                            {c.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <h1 className="font-display text-2xl font-extrabold capitalize">{product.name}</h1>
              <p className="mt-2 text-3xl font-semibold">{formatCOP(product.price)}</p>

              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                {(product.height_cm != null || product.width_cm != null) && (
                  <div className="flex gap-2">
                    <dt className="font-medium text-foreground">Medidas:</dt>
                    <dd>
                      {product.height_cm != null && product.width_cm != null
                        ? `${num(product.height_cm)} x ${num(product.width_cm)} cm`
                        : `${num(product.height_cm ?? product.width_cm)} cm de ${
                            product.height_cm != null ? "alto" : "ancho"
                          }`}
                    </dd>
                  </div>
                )}
                {product.compartments != null && (
                  <div className="flex gap-2">
                    <dt className="font-medium text-foreground">
                      {product.compartments === 1 ? "1 compartimiento" : `${product.compartments} compartimientos`}
                    </dt>
                  </div>
                )}
                {product.material && (
                  <div className="flex gap-2">
                    <dt className="font-medium text-foreground">Material:</dt>
                    <dd className="capitalize">{product.material}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="font-medium text-foreground">Disponibilidad:</dt>
                  <dd>Se hace por pedido. Te contamos el tiempo de entrega al confirmar.</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Cantidad</span>
                <div className="flex items-center rounded-lg border">
                  <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">{Math.min(qty, remaining)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={qty >= remaining}
                    onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {inCart > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Ya tienes {inCart} {inCart === 1 ? "unidad" : "unidades"}
                  {hasColors && selectedLabel ? ` en ${selectedLabel}` : ""} de este producto en tu
                  carrito.
                </p>
              )}

              <Button
                className="mt-6"
                size="lg"
                disabled={adding || !product.in_stock || (hasColors && !selected)}
                onClick={handleAdd}
              >
                <ShoppingCart className="h-4 w-4" />
                {!product.in_stock
                  ? "Por ahora no se puede pedir"
                  : adding
                    ? "Agregando..."
                    : "Agregar al carrito"}
              </Button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
