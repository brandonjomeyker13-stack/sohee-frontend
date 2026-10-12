import { createServerFn } from "@tanstack/react-start";

// Identificador público de la app en Google. No es un secreto: el
// navegador lo manda igual al abrir "Continuar con Google". Si en Vercel
// hay GOOGLE_CLIENT_ID, ese gana; si no, se usa este para que /auth
// cargue. Sin ninguno, la página entera fallaba antes de mostrar el
// formulario.
const GOOGLE_CLIENT_ID =
  "469926197059-3jh9i11p3ohatakpu4gne0nen3hmccla.apps.googleusercontent.com";

export const getGoogleClientId = createServerFn({ method: "GET" }).handler(async () => {
  return process.env["GOOGLE_CLIENT_ID"] || GOOGLE_CLIENT_ID;
});
