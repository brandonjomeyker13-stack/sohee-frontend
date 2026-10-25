export const API_BASE = "https://proyecto-leidy-nq86.onrender.com/api/v1";

/* ---------- Token en memoria (NO localStorage) ---------- */

let accessToken: string | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string | null) {
  accessToken = token;
}

/** Handler registrado por el AuthProvider para renovar el access token con la cookie httpOnly. */
let refreshHandler: (() => Promise<string | null>) | null = null;
export function setRefreshHandler(fn: (() => Promise<string | null>) | null) {
  refreshHandler = fn;
}

/**
 * POST /auth/refresh usando la cookie de refresh (credentials: include).
 * El backend ROTA el refresh token en cada llamada: si se disparan dos
 * refresh en paralelo, el segundo reusa una cookie ya consumida y el backend
 * la invalida (401 + delete_cookie), cerrando la sesión. Por eso todas las
 * llamadas comparten una sola petición en vuelo (single-flight).
 */
let refreshInFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        accessToken = null;
        return null;
      }
      const data = (await res.json()) as { access_token?: string };
      accessToken = data.access_token ?? null;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseError(res: Response) {
  let msg = `Error ${res.status}`;
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") msg = body.detail;
    else if (Array.isArray(body?.detail)) msg = body.detail.map((d: any) => d.msg).join(", ");
  } catch {
    /* noop */
  }
  return new ApiError(msg, res.status);
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  const doFetch = async (token: string | null) => {
    const finalHeaders = new Headers(headers);
    if (auth && token) finalHeaders.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: "include",
      headers: finalHeaders,
    });
  };

  let res = await doFetch(getToken());

  // Interceptor 401: intenta renovar el access token una sola vez.
  if (res.status === 401 && auth) {
    const newToken = refreshHandler ? await refreshHandler() : await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}


export async function apiJson<T>(
  path: string,
  method: string,
  body: unknown,
  auth = false,
): Promise<T> {
  return api<T>(path, {
    method,
    auth,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* ---------- Tipos ---------- */

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string | null;
  city?: string | null;
  is_active: boolean;
  is_admin: boolean;
  accepted_terms: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  position: number;
  /** Color al que pertenece la foto; null = foto general (se ve con cualquier color). */
  color?: string | null;
}

/** Color disponible, tal como lo entrega la API. */
export interface ProductColor {
  value: string;
  label: string;
  hex: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  cost?: string | null;
  /** Si es false, el producto queda oculto: no se puede pedir. */
  in_stock: boolean;
  /** Alto en cm. */
  height_cm?: number | string | null;
  /** Ancho en cm. */
  width_cm?: number | string | null;
  /** Cantidad de compartimientos. */
  compartments?: number | null;
  /** Material del bolso o morral. */
  material?: string | null;
  image_url?: string | null;
  images?: ProductImage[];
  /** Colores en los que viene el producto. */
  colors?: ProductColor[];
  category?: Category | null;
}

export interface SalesSummary {
  revenue: number;
  cost: number;
  profit: number;
  items_sold: number;
  items_without_cost: number;
  orders_count: number;
}

export interface SalesPeriod extends SalesSummary {
  period: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  /** Color elegido; null en productos sin colores. */
  color?: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  /** Color del producto pedido; null si no maneja colores. */
  color?: string | null;
}

/** Datos del comprador que el backend puede adjuntar a un pedido (solo admin). */
export interface OrderCustomer {
  id?: number;
  name?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
}

/** Forma de pago elegida por la clienta al confirmar el pedido. */
export type PaymentMethod = "CASH" | "NEQUI";

/** Quién cerró el pedido: la clienta, la tienda, o nadie todavía. */
export type ClosedBy = "CUSTOMER" | "SELLER" | null;

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  reference: string;
  created_at: string;
  delivered_at?: string | null;
  delivery_confirmed_at?: string | null;
  payment_method?: PaymentMethod | string | null;
  closed_by?: ClosedBy;
  items: OrderItem[];
  /** Presentes solo en la vista admin, según lo que devuelva el backend. */
  user?: OrderCustomer | null;
  customer?: OrderCustomer | null;
  user_id?: number | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_city?: string | null;
  customer_phone?: string | null;
}

/** Normaliza los datos del comprador vengan como vengan del backend. */
export function orderCustomer(order: Order): OrderCustomer | null {
  const src = order.user ?? order.customer ?? null;
  const c: OrderCustomer = {
    id: src?.id ?? order.user_id ?? undefined,
    name: src?.name ?? order.customer_name ?? null,
    email: src?.email ?? order.customer_email ?? null,
    address: src?.address ?? order.customer_address ?? null,
    city: src?.city ?? order.customer_city ?? null,
    phone: src?.phone ?? order.customer_phone ?? null,
  };
  return c.name || c.email || c.address || c.city || c.phone || c.id ? c : null;
}

export interface CheckoutResponse {
  order_id: number;
  /** Solo llega con pago en línea; con pago contra entrega viene vacío. */
  public_key?: string | null;
  currency: string;
  amount_in_cents: number;
  reference: string;
  signature?: string | null;
  payment_method?: PaymentMethod | string | null;
}

/* ---------- Endpoints ---------- */

export const logoutRequest = () =>
  fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => null);



export const getCategories = () => api<Category[]>("/categories/");

export const createCategory = (name: string) =>
  apiJson<Category>("/categories/", "POST", { name }, true);

export const updateCategory = (id: number, name: string) =>
  apiJson<Category>(`/categories/${id}`, "PATCH", { name }, true);

export const deleteCategory = (id: number) =>
  api<void>(`/categories/${id}`, { method: "DELETE", auth: true });

export const getProducts = (limit = 1000, skip = 0, categoryId?: number | null) =>
  api<Product[]>(
    `/products/?skip=${skip}&limit=${limit}${categoryId ? `&category_id=${categoryId}` : ""}`,
  );

export const getProduct = (id: number | string) => api<Product>(`/products/${id}`);

/** Detalle con el costo real (solo admin). */
export const getProductAdmin = (id: number | string) =>
  api<Product>(`/products/${id}/admin`, { auth: true });

export const createProduct = (data: Record<string, unknown>) =>
  apiJson<Product>("/products/", "POST", data, true);

export const updateProduct = (id: number, data: Record<string, unknown>) =>
  apiJson<Product>(`/products/${id}`, "PUT", data, true);

export const deleteProduct = (id: number) =>
  api<void>(`/products/${id}`, { method: "DELETE", auth: true });

export const uploadProductImage = (id: number, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return api<Product>(`/products/${id}/image`, { method: "POST", auth: true, body: fd });
};

/** Paleta completa de colores que acepta la API. */
export const getProductColors = () => api<ProductColor[]>("/products/colors");

/** Reemplaza los colores del producto: manda SIEMPRE la lista completa. */
export const setProductColors = (id: number, colors: string[]) =>
  apiJson<Product>(`/products/${id}/colors`, "PUT", { colors }, true);

/** Catálogo completo (admin) para llevar productos a otra tienda. */
export interface CatalogExport {
  exported_at: string;
  source: string;
  categories: { name: string }[];
  products: {
    name: string;
    price: string;
    cost?: string | null;
    height_cm?: string | null;
    width_cm?: string | null;
    compartments?: number | null;
    material?: string | null;
    in_stock: boolean;
    category: string;
    colors: string[];
    images: {
      url: string;
      storage_path?: string | null;
      color?: string | null;
      position: number;
    }[];
  }[];
}

export const exportCatalog = () => api<CatalogExport>("/products/export", { auth: true });

/** Agrega hasta 4 imágenes a la galería del producto (campo `files` repetido). */
export const uploadProductImages = (id: number, files: File[], color?: string | null) => {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const qs = color ? `?color=${encodeURIComponent(color)}` : "";
  return api<Product>(`/products/${id}/images${qs}`, { method: "POST", auth: true, body: fd });
};

export const deleteProductImage = (productId: number, imageId: number) =>
  api<void>(`/products/${productId}/images/${imageId}`, { method: "DELETE", auth: true });


export const getCart = () => api<CartItem[]>("/cart/", { auth: true });
export const addToCart = (product_id: number, quantity: number, color?: string | null) =>
  apiJson<CartItem>(
    "/cart/",
    "POST",
    color ? { product_id, quantity, color } : { product_id, quantity },
    true,
  );
export const updateCartItem = (id: number, quantity: number) =>
  apiJson<CartItem>(`/cart/${id}`, "PUT", { quantity }, true);
export const removeCartItem = (id: number) =>
  api<void>(`/cart/${id}`, { method: "DELETE", auth: true });

export const checkout = (payment_method: PaymentMethod) =>
  apiJson<CheckoutResponse>("/orders/checkout", "POST", { payment_method }, true);
export const getOrders = () => api<Order[]>("/orders/", { auth: true });
export const getAllOrders = () => api<Order[]>("/orders/admin/all?limit=200", { auth: true });
/** Reabre el pago de un pedido ya creado (PENDING / DECLINED / ERROR). */
export const payExistingOrder = (id: number) =>
  api<CheckoutResponse>(`/orders/${id}/pay`, { method: "POST", auth: true });
/** El cliente cancela su propio pedido mientras siga PENDING. */
export const cancelOrder = (id: number) =>
  api<Order>(`/orders/${id}/cancel`, { method: "PATCH", auth: true });
/** El cliente confirma que recibió su pedido. */
export const confirmDelivery = (id: number) =>
  api<Order>(`/orders/${id}/confirm-delivery`, { method: "PATCH", auth: true });

export const updateOrderStatus = (id: number, status: "IN_TRANSIT" | "AWAITING_CONFIRMATION" | "DELIVERED") =>
  apiJson<Order>(`/orders/${id}/status`, "PATCH", { status }, true);

export const getTotalSales = () => api<SalesSummary>("/sales/total", { auth: true });
export const getDailySales = () => api<SalesPeriod[]>("/sales/daily", { auth: true });
export const getWeeklySales = () => api<SalesPeriod[]>("/sales/weekly", { auth: true });
export const getMonthlySales = () => api<SalesPeriod[]>("/sales/monthly", { auth: true });

export const formatCOP = (value: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));

export function wompiCheckoutUrl(c: CheckoutResponse, redirectUrl: string) {
  const params = new URLSearchParams({
    "public-key": c.public_key ?? "",
    currency: c.currency,
    "amount-in-cents": String(c.amount_in_cents),
    reference: c.reference,
    "signature:integrity": c.signature ?? "",
    "redirect-url": redirectUrl,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

export const updateProfile = (data: {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
}) => apiJson<User>("/auth/me", "PATCH", data, true);

/**
 * Define o cambia la contraseña del usuario autenticado.
 * current_password solo es necesaria si la cuenta ya tiene una (p. ej. no vino de Google).
 */
export const changePassword = (new_password: string, current_password?: string) =>
  apiJson<{ detail?: string }>(
    "/auth/set-password",
    "POST",
    current_password ? { new_password, current_password } : { new_password },
    true,
  );
