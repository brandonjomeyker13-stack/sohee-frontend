import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertCircle, PackageOpen, RefreshCw } from "lucide-react";
import { getCategories, getProducts, type Product } from "@/lib/api";
import { fuzzyFilter } from "@/lib/fuzzy";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryNav } from "@/components/CategoryNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";



const SITE_URL = "https://proyecto-l.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sohee | Bolsos y morrales en línea" },
      {
        name: "description",
        content:
          "Compra bolsos, morrales y accesorios Sohee. Pagas cuando recibes tu pedido.",
      },
      { property: "og:title", content: "Sohee | Bolsos y morrales en línea" },
      {
        property: "og:description",
        content: "Compra bolsos y morrales Sohee. Pagas cuando recibes tu pedido.",
      },
      { property: "og:url", content: SITE_URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const filtered = useMemo(() => {
    let list = (data ?? []).filter((p) => p.in_stock);
    if (categoryId) list = list.filter((p) => p.category?.id === categoryId);
    return fuzzyFilter(list, search, (p: Product) =>
      [
        p.name,
        (p.colors ?? []).map((c) => c.label).join(" "),
        p.material ?? "",
        p.category?.name ?? "",
      ].join(" "),
    );
  }, [data, search, categoryId]);



  return (
    <div className="min-h-screen bg-background">
      <Header search={search} onSearch={setSearch} />
      <CategoryNav
        categories={categories ?? []}
        categoryId={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="mx-auto max-w-6xl px-4">
        <section className="border-b border-border py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Nueva temporada
              </p>
              <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:mx-0 lg:text-6xl">
                Bolsos y morrales para todos los días
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground lg:mx-0">
                Diseños simples en cuero y lona, con materiales duraderos. Cada pieza se hace por
                pedido y te la llevamos a tu casa.
              </p>
              <div className="mt-8">
                <Button size="lg" className="rounded-full px-8" asChild>
                  <a href="#coleccion">Ver colección</a>
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <HeroCarousel products={data ?? []} />
            </div>
          </div>
        </section>

        <section id="coleccion" className="py-14 sm:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {search ? `Resultados para “${search}”` : "Colección"}
            </h2>
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              </p>
            )}
          </div>






          {error ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-20 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
              <div>
                <p className="text-lg font-medium text-foreground">No pudimos cargar la tienda</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revisa tu conexión e inténtalo nuevamente.
                </p>
              </div>
              <Button onClick={() => refetch()} disabled={isFetching} className="rounded-full">
                <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                Reintentar conexión
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-24 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                <PackageOpen className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium text-foreground">
                {search ? "Sin resultados" : "Próximamente"}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Prueba con otro nombre, color o modelo."
                  : "Estamos preparando nuestra primera colección de bolsos y morrales. Vuelve pronto."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Sohee · Pagas al recibir tu pedido
      </footer>
    </div>
  );
}
