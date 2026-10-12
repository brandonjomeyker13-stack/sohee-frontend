import { createFileRoute } from "@tanstack/react-router";
import { LegalDocPage } from "@/components/LegalDocPage";
import { TERMS } from "@/lib/legal";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones | Sohee" },
      {
        name: "description",
        content:
          "Términos y condiciones de uso y compra de la tienda en línea Sohee: pagos, envíos, garantía y derecho de retracto.",
      },
      { property: "og:title", content: "Términos y Condiciones | Sohee" },
      {
        property: "og:description",
        content: "Condiciones de compra, envíos, garantía y derecho de retracto en Sohee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalDocPage doc={TERMS} />,
});
