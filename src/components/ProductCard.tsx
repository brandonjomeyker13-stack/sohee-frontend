import { Link } from "@tanstack/react-router";
import { formatCOP, type Product } from "@/lib/api";
import { ImageOff } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/producto/$productId"
      params={{ productId: String(product.id) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-card transition-all duration-200 hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </div>
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
