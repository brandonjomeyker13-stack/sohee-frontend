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
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoSohee } from "@/components/LogoSohee";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
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

        <nav className="hidden shrink-0 items-center gap-1 md:flex" aria-label="Principal">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
              <Home className="h-4 w-4" />
              Inicio
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/pedidos" activeProps={{ className: "text-foreground" }}>
              <Package className="h-4 w-4" />
              Pedidos
            </Link>
          </Button>

          {user?.is_admin && (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/admin" search={{ editar: undefined }} activeProps={{ className: "text-foreground" }}>
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground" asChild>
            <Link to="/carrito" aria-label={`Carrito, ${count} artículos`} activeProps={{ className: "text-foreground" }}>
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Carrito</span>
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
                  Cuenta
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/auth" search={{ redirect: pathname }}>
                <UserIcon className="h-4 w-4" />
                Ingresar
              </Link>
            </Button>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground" asChild>
            <Link to="/carrito" aria-label={`Carrito, ${count} artículos`}>
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" aria-label="Abrir menú">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link to="/" activeOptions={{ exact: true }}>
                  <Home className="h-4 w-4" />
                  Inicio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pedidos">
                  <Package className="h-4 w-4" />
                  Pedidos
                </Link>
              </DropdownMenuItem>
              {user?.is_admin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" search={{ editar: undefined }}>
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/cuenta">
                      <UserIcon className="h-4 w-4" />
                      Cuenta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void logout()}>
                    <LogOut className="h-4 w-4" />
                    Salir
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth" search={{ redirect: pathname }}>
                    <UserIcon className="h-4 w-4" />
                    Ingresar
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

