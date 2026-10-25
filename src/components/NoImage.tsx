import { ImageOff } from "lucide-react";

export function NoImage({ compact }: { compact?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Sin imagen"
      className="grid h-full w-full place-items-center bg-muted text-muted-foreground"
    >
      <div className={`flex flex-col items-center text-center ${compact ? "gap-0.5 px-1" : "gap-1.5 px-3"}`}>
        <ImageOff className={compact ? "h-5 w-5 opacity-70" : "h-8 w-8 opacity-70"} aria-hidden />
        {!compact && <span className="text-xs font-medium">Sin imagen</span>}
      </div>
    </div>
  );
}
