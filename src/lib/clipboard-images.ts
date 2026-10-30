/** Fotos copiadas (captura, WhatsApp, navegador). `files` a veces viene vacío; `items` sí trae la imagen. */
export function imagesFromClipboard(data: DataTransfer | null | undefined): File[] {
  if (!data) return [];
  const fromItems = Array.from(data.items ?? [])
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => !!file);
  if (fromItems.length) return fromItems;
  return Array.from(data.files ?? []).filter((file) => file.type.startsWith("image/"));
}

export function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest("input, textarea, select, [contenteditable=true]");
}
