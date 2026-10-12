import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  ShoppingCart,
  Package,
  LogOut,
  Search,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoSohee } from "@/components/LogoSohee";


export function Header({
  search,
  onSearch,
}: {
  search?: string;
  onSearch?: (v: string) => void;
}) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
  });
  const count = cart?.reduce((a, c) => a + c.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <LogoSohee className="h-8 w-8 shrink-0 text-primary" viewBox="250 120 800 800" />
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            {user ? user.name : "sohee"}
          </span>
        </Link>



        {onSearch && (
          <div className="relative hidden min-w-0 flex-1 sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearch?.(e.target.value)}
              aria-label="Buscar productos"
              placeholder="Buscar productos"
              className="h-10 rounded-full border-border bg-muted/60 pl-9 shadow-none focus-visible:bg-card"
            />
          </div>
        )}

        <nav className="flex shrink-0 items-center gap-1" aria-label="Principal">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Inicio</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/pedidos" activeProps={{ className: "text-foreground" }}>
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Pedidos</span>
            </Link>
          </Button>

          {user?.is_admin && (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/admin" search={{ editar: undefined }} activeProps={{ className: "text-foreground" }}>
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground" asChild>
            <Link to="/carrito" aria-label={`Carrito, ${count} artículos`} activeProps={{ className: "text-foreground" }}>
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/cuenta" activeProps={{ className: "text-foreground" }}>
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Cuenta</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={logout}
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </>

          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/auth" search={{ redirect: pathname }}>
                <UserIcon className="h-4 w-4" />
                <span className="hidden md:inline">Ingresar</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>

      {onSearch && (
        <div className="border-t border-border px-4 py-2 sm:hidden">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearch?.(e.target.value)}
              aria-label="Buscar productos"
              placeholder="Buscar productos"
              className="h-10 rounded-full border-border bg-muted/60 pl-9 shadow-none focus-visible:bg-card"
            />
          </div>
        </div>
      )}
    </header>
  );
}

