import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/api";

interface HeroCarouselProps {
  products: Product[];
  autoPlayMs?: number;
}

export function HeroCarousel({ products, autoPlayMs = 5000 }: HeroCarouselProps) {
  const slides = useMemo(() => {
    const withImages = products.filter((p) => p.image_url);
    return withImages.length > 0 ? withImages.slice(0, 5) : [];
  }, [products]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [slides.length, paused, autoPlayMs]);

  if (slides.length === 0) return null;

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  return (
    <div
      className="relative isolate overflow-hidden rounded-3xl bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Imágenes destacadas de la colección"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        {slides.map((product, i) => (
          <div
            key={product.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <img
              src={product.image_url!}
              alt={product.name}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur-md">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-foreground" : "w-2 bg-foreground/30 hover:bg-foreground/50"
                }`}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 text-foreground backdrop-blur-md hover:bg-background sm:flex"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full bg-background/80 text-foreground backdrop-blur-md hover:bg-background sm:flex"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
