import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { LegalDoc } from "@/lib/legal";
import { Button } from "@/components/ui/button";

export function LegalDocPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6 rounded-full text-muted-foreground" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </Button>

        <header className="mb-10 border-b pb-8">
          <p className="text-sm font-medium text-muted-foreground">{doc.subtitle}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Última actualización: {doc.updated}</p>
        </header>

        <div className="space-y-10">
          {doc.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="font-display text-lg font-semibold tracking-tight">{section.title}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
