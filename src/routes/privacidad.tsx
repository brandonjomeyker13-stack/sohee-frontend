import { createFileRoute } from "@tanstack/react-router";
import { LegalDocPage } from "@/components/LegalDocPage";
import { PRIVACY } from "@/lib/legal";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Datos Personales | Sohee" },
      {
        name: "description",
        content:
          "Política de tratamiento de datos personales de Sohee conforme a la Ley 1581 de 2012 en Colombia.",
      },
      { property: "og:title", content: "Política de Datos Personales | Sohee" },
      {
        property: "og:description",
        content: "Cómo Sohee recolecta, usa y protege tus datos personales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LegalDocPage doc={PRIVACY} />,
});
