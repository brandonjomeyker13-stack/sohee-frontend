import type { Category } from "@/lib/api";

export function CategoryNav({
  categories,
  categoryId,
  onSelect,
}: {
  categories: Category[];
  categoryId: number | null;
  onSelect: (id: number | null) => void;
}) {
  if (!categories.length) return null;

  return (
    <nav
      aria-label="Categorías"
      className="sticky top-14 z-30 border-b border-border bg-card/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-current={categoryId === null ? "true" : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
            categoryId === null
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-current={categoryId === c.id ? "true" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
              categoryId === c.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
