import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImageOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteProduct, formatCOP, getProducts, type Product } from "@/lib/api";
import { fuzzyFilter } from "@/lib/fuzzy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/productos")({
  head: () => ({
    meta: [
      { title: "Lista de productos | Sohee" },
      { name: "description", content: "Revisa, edita y organiza los productos de la tienda Sohee." },
    ],
  }),
  component: AdminProductsList,
});

function AdminProductsList() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => fuzzyFilter(products ?? [], search, (p: Product) => `${p.name} ${p.category?.name ?? ""}`),
    [products, search],
  );

  /** Agrupa por categoría para que la lista se vea ordenada. */
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = p.category?.name ?? "Sin categoría";
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const remove = async (p: Product) => {
    try {
      await deleteProduct(p.id);
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="pl-9"
            aria-label="Buscar producto"
          />
        </div>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link to="/admin" search={{ editar: undefined }}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-medium">{search ? "Sin resultados" : "Todavía no hay productos"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Prueba con otro nombre." : "Crea el primero con el botón “Nuevo producto”."}
          </p>
        </div>
      ) : (
        groups.map(([category, list]) => (
          <section key={category} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {category} ({list.length})
            </h2>
            <div className="space-y-2">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCOP(p.price)} · {p.images?.length ?? 0} foto
                      {(p.images?.length ?? 0) === 1 ? "" : "s"}
                    </p>
                    {!!p.colors?.length && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p.colors.map((c) => (
                          <span
                            key={c.value}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            <span
                              style={{ backgroundColor: c.hex }}
                              className="h-3 w-3 rounded-full border border-border"
                            />
                            {c.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to="/admin" search={{ editar: p.id }} aria-label={`Editar ${p.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Eliminar ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                      title={`¿Eliminar "${p.name}"?`}
                      description="Esta acción no se puede deshacer. El producto dejará de estar disponible en la tienda."
                      confirmLabel="Sí, eliminar"
                      onConfirm={() => remove(p)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
