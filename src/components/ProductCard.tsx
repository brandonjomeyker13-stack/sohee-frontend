import { Link } from "@tanstack/react-router";
import { formatCOP, type Product } from "@/lib/api";
import { NoImage } from "@/components/NoImage";

function productThumb(product: Product) {
  return product.image_url || product.images?.[0]?.image_url || null;
}

export function ProductCard({ product }: { product: Product }) {
  const thumb = productThumb(product);
  return (
    <Link
      to="/producto/$productId"
      params={{ productId: String(product.id) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-card transition-all duration-200 hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <NoImage />
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1 py-3">
        <p className="line-clamp-1 text-sm font-medium capitalize text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {[(product.colors ?? []).map((c) => c.label).join(", "), product.material]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
          {formatCOP(product.price)}
        </p>
      </div>
    </Link>
  );
}
