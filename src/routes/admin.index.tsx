import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
import {
  createProduct,
  getCategories,
  getProducts,
  getProductAdmin,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
  getProductColors,
  setProductColors,
  type Product,
  type ProductImage,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";


export const Route = createFileRoute("/admin/")({
  validateSearch: (search: Record<string, unknown>) => ({
    editar:
      typeof search.editar === "string" || typeof search.editar === "number"
        ? Number(search.editar)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nuevo producto | Sohee" },
      { name: "description", content: "Crea o edita productos de la tienda Sohee." },
    ],
  }),
  component: AdminProducts,
});

const empty = {
  name: "",
  height_cm: "",
  width_cm: "",
  compartments: "",
  material: "",
  price: "",
  cost: "",
  category_id: "",
  in_stock: true,
};

function AdminProducts() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { editar } = Route.useSearch();
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: palette } = useQuery({ queryKey: ["product-colors"], queryFn: getProductColors });
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  /** Fotos elegidas antes de crear el producto, ya con su color asignado. */
  const [pending, setPending] = useState<{ file: File; color: string | null }[]>([]);
  /** Cola de fotos recién agregadas a las que falta asignarles color. */
  const [ask, setAsk] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Producto en edición con datos frescos del catálogo (para ver sus fotos por caja). */
  const editingFresh = editing ? (products?.find((p) => p.id === editing.id) ?? editing) : null;
  /** Colores que ya tiene el producto en edición (vienen de las fotos). */

  /** Avisa si ya existe otro producto con el mismo nombre, pero no bloquea. */
  const trimmedName = form.name.trim().toLowerCase();
  const duplicate = trimmedName.length >= 2
    ? products?.find(
        (p) =>
          p.name.trim().toLowerCase() === trimmedName &&
          (!editing || p.id !== editing.id),
      )
    : undefined;

  const addFiles = (incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setAsk((prev) => [...prev, ...imgs]);
  };

  /** Al elegir el color de una foto, la sube (o la deja en cola si el producto es nuevo). */
  const assignColor = (color: string | null) => {
    void finishAssign(color);
  };

  const finishAssign = async (color: string | null) => {
    const file = ask[0];
    if (!file) return;
    setAsk((prev) => prev.slice(1));
    if (editingFresh) {
      try {
        await uploadProductImages(editingFresh.id, [file], color);
        // Los colores disponibles son los que ya tienen fotos.
        const currentColors = Array.from(
          new Set(
            (editingFresh.images ?? [])
              .map((i) => i.color)
              .filter((v): v is string => !!v),
          ),
        );
        if (color && !currentColors.includes(color)) currentColors.push(color);
        await setProductColors(editingFresh.id, currentColors);
        await qc.invalidateQueries({ queryKey: ["products"] });
        toast.success("Foto agregada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo subir la foto");
      }
    } else {
      setPending((prev) => [...prev, { file, color }]);
    }
  };

  const reset = () => {
    setForm(empty);
    setEditing(null);
    setPending([]);
    setAsk([]);
    if (fileRef.current) fileRef.current.value = "";
    void navigate({ to: "/admin", search: { editar: undefined } });
  };

  const startEdit = async (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      height_cm: p.height_cm != null ? String(p.height_cm) : "",
      width_cm: p.width_cm != null ? String(p.width_cm) : "",
      compartments: p.compartments != null ? String(p.compartments) : "",
      material: p.material ?? "",
      price: String(p.price),
      cost: p.cost != null ? String(p.cost) : "",
      category_id: p.category ? String(p.category.id) : "",
      in_stock: p.in_stock,
    });
    setPending([]);
    setAsk([]);

    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const full = await getProductAdmin(p.id);
      setForm((f) => ({ ...f, cost: full.cost != null ? String(full.cost) : f.cost }));
    } catch {
      /* si falla, se conserva lo que ya había */
    }
  };

  // Si llega ?editar=ID desde la lista de productos, abre ese producto para editarlo.
  useEffect(() => {
    if (!editar || !products?.length || editing?.id === editar) return;
    const p = products.find((x) => x.id === editar);
    if (p) void startEdit(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editar, products]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) {
      toast.error("Selecciona una categoría para el producto");
      return;
    }
    if (form.height_cm !== "" && Number(form.height_cm) <= 0) {
      toast.error("El alto debe ser mayor que cero");
      return;
    }
    if (form.width_cm !== "" && Number(form.width_cm) <= 0) {
      toast.error("El ancho debe ser mayor que cero");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        height_cm: form.height_cm !== "" ? Number(form.height_cm) : null,
        width_cm: form.width_cm !== "" ? Number(form.width_cm) : null,
        compartments: form.compartments !== "" ? Number(form.compartments) : null,
        material: form.material.trim() !== "" ? form.material.trim() : null,
        price: Number(form.price),
        category_id: Number(form.category_id),
        in_stock: form.in_stock,
      };
      if (form.cost !== "") payload.cost = Number(form.cost);
      const saved = editing
        ? await updateProduct(editing.id, payload)
        : await createProduct(payload);
      // Sube las fotos ya agrupadas por el color que se les asignó al elegirlas.
      const groups = new Map<string | null, File[]>();
      for (const item of pending) {
        const list = groups.get(item.color) ?? [];
        list.push(item.file);
        groups.set(item.color, list);
      }
      for (const [color, group] of groups) {
        await uploadProductImages(saved.id, group.slice(0, 10), color);
      }
      // Los colores disponibles son solo los que ya tienen fotos.
      const derivedColors = Array.from(
        new Set(
          [
            ...(editingFresh?.images ?? []).map((i) => i.color),
            ...pending.map((p) => p.color),
          ].filter((v): v is string => !!v),
        ),
      );
      await setProductColors(saved.id, derivedColors);

      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Producto actualizado" : "Producto creado");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const changeImage = async (p: Product, fs: File[], color?: string | null) => {
    try {
      await uploadProductImages(p.id, fs.slice(0, 10), color ?? null);
      const colors = Array.from(
        new Set(
          [...(p.images ?? []).map((i) => i.color), color].filter((v): v is string => !!v),
        ),
      );
      await setProductColors(p.id, colors);
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(fs.length > 1 ? "Imágenes agregadas" : "Imagen agregada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir la imagen");
    }
  };

  const removeImage = async (p: Product, imageId: number) => {
    try {
      await deleteProductImage(p.id, imageId);
      const colors = Array.from(
        new Set(
          (p.images ?? [])
            .filter((i) => i.id !== imageId)
            .map((i) => i.color)
            .filter((v): v is string => !!v),
        ),
      );
      await setProductColors(p.id, colors);
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Imagen eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la imagen");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3">
      <Link
        to="/admin/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a la lista de productos
      </Link>
      <form
        onSubmit={submit}
        className="card-surface h-fit space-y-4 p-5"
        onPaste={(e) => {
          const imgs = Array.from(e.clipboardData?.files ?? []).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (imgs.length) {
            e.preventDefault();
            addFiles(imgs);
          }
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h2 className="font-display text-lg font-bold">
            {editing ? `Editar #${editing.id}` : "Nuevo producto"}
          </h2>
          {editing && (
            <Button type="button" variant="ghost" size="icon" onClick={reset}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Nombre</Label>
              <Input id="p-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {duplicate && (
                <p className="text-xs text-accent">
                  Ya existe un producto llamado “{duplicate.name}”. Puedes guardar este igual, pero
                  revisa que no sea el mismo.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-material">Material</Label>
              <Input
                id="p-material"
                placeholder="Ej: Lona satinada"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-height">Alto (cm)</Label>
                <Input
                  id="p-height"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Ej: 43"
                  value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-width">Ancho (cm)</Label>
                <Input
                  id="p-width"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Ej: 33"
                  value={form.width_cm}
                  onChange={(e) => setForm({ ...form, width_cm: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-compartments">Compartimientos</Label>
              <Input
                id="p-compartments"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 3"
                value={form.compartments}
                onChange={(e) => setForm({ ...form, compartments: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Déjalo vacío si no quieres mostrarlo en la ficha del producto.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Precio (COP)</Label>
                <Input id="p-price" type="number" min="1" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-cost">Costo del producto (COP)</Label>
              <Input
                id="p-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder={editing ? "Dejar vacío para no cambiarlo" : "Opcional"}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Se usa para calcular tu ganancia real en la pestaña “Ganancias”. Al editar se carga el
                costo actual del producto; si lo dejas vacío, se conserva el que ya tenía.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-category">Categoría</Label>
              <select
                id="p-category"
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Selecciona una categoría</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!categories?.length && (
                <p className="text-xs text-muted-foreground">
                  Crea primero una categoría en la pestaña “Categorías”.
                </p>
              )}
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3">
              <span>
                <span className="block text-sm font-medium">
                  {form.in_stock ? "Se puede pedir" : "Oculto del catálogo"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Apágalo si por ahora no lo haces. No hay inventario: se pide a demanda.
                </span>
              </span>
              <Switch
                checked={form.in_stock}
                onCheckedChange={(v) => setForm({ ...form, in_stock: v })}
              />
            </label>
          </div>

          <div className="space-y-3">
            <Label>Fotos del producto</Label>

              <input
                id="p-file"
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(Array.from(e.dataTransfer.files));
                }}
                onPaste={(e) => {
                  const imgs = Array.from(e.clipboardData.files).filter((f) =>
                    f.type.startsWith("image/"),
                  );
                  if (imgs.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    addFiles(imgs);
                  }
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Toca para elegir, arrastra las fotos aquí o pégalas (Ctrl+V)
                </p>
                <p className="text-xs text-muted-foreground">
                  Por cada foto te preguntamos de qué color es.
                </p>
              </div>

              {/* Fotos ya elegidas para un producto nuevo, agrupadas por color */}
              {!editingFresh && pending.length > 0 && (
                <div className="space-y-2">
                  {Array.from(new Set(pending.map((p) => p.color))).map((color) => {
                    const c = color ? palette?.find((p) => p.value === color) : null;
                    return (
                      <div key={color ?? "general"} className="space-y-2 rounded-xl border border-border p-3">
                        <div className="flex items-center gap-2">
                          {c && (
                            <span
                              style={{ backgroundColor: c.hex }}
                              className="h-5 w-5 rounded-full border border-border"
                            />
                          )}
                          <p className="text-sm font-semibold">
                            {c ? c.label : "Fotos generales"}
                          </p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {pending.map((item, i) =>
                            item.color === color ? (
                              <div key={i} className="relative">
                                <img
                                  src={URL.createObjectURL(item.file)}
                                  alt={`Foto ${i + 1}`}
                                  className="aspect-square w-full rounded-lg border border-border object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPending((prev) => prev.filter((_, j) => j !== i))}
                                  aria-label={`Quitar foto ${i + 1}`}
                                  className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : null,
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {editingFresh && (
                <>
                  {/* Fotos generales ya subidas: solo se muestran para poder borrarlas */}
                  {(editingFresh.images ?? []).some((i) => !i.color) && (
                    <div className="space-y-2 rounded-xl border border-border p-3">
                      <p className="text-sm font-semibold">Fotos que sirven para todos los colores</p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {(editingFresh.images ?? [])
                          .filter((i) => !i.color)
                          .sort((a, b) => a.position - b.position)
                          .map((img) => (
                            <span key={img.id} className="relative">
                              <img
                                src={img.image_url}
                                alt=""
                                className="aspect-square w-full rounded-lg border border-border object-cover"
                              />
                              <ConfirmDialog
                                trigger={
                                  <button
                                    type="button"
                                    aria-label="Eliminar imagen"
                                    className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-destructive-foreground"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                }
                                title="¿Eliminar esta imagen?"
                                description="La foto se quitará de la galería del producto de forma permanente."
                                confirmLabel="Sí, eliminar"
                                onConfirm={() => removeImage(editingFresh, img.id)}
                              />
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {(palette ?? [])
                    .filter((c) => (editingFresh.images ?? []).some((i) => i.color === c.value))
                    .map((c) => (
                      <PhotoBox
                        key={c.value}
                        title={c.label}
                        hex={c.hex}
                        images={(editingFresh.images ?? []).filter((i) => i.color === c.value)}
                        onUpload={(fs) => changeImage(editingFresh, fs, c.value)}
                        onDelete={(imageId) => removeImage(editingFresh, imageId)}
                      />
                    ))}
                </>
              )}
          </div>
        </div>

        {/* Pregunta el color de cada foto recién agregada */}
        <Dialog
          open={ask.length > 0}
          onOpenChange={(v) => !v && setAsk([])}
        >
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>¿De qué color es esta foto?</DialogTitle>
              <DialogDescription>
                Elige el color del bolso que se ve en la foto. Si es un detalle que se ve igual en todos los colores
                (el cierre, la etiqueta, el interior), usa “Sirve para todos”.
              </DialogDescription>
            </DialogHeader>
            {ask[0] && (
              <img
                src={URL.createObjectURL(ask[0])}
                alt="Foto por asignar"
                className="mx-auto h-32 w-32 rounded-xl border border-border object-cover"
              />
            )}
            {ask.length > 1 && (
              <p className="text-center text-xs text-muted-foreground">
                Quedan {ask.length - 1} foto(s) más por asignar.
              </p>
            )}
            <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-5">
              {(palette ?? []).map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => assignColor(c.value)}
                  className="flex min-w-0 flex-col items-center gap-1 text-center"
                >
                  <span
                    style={{ backgroundColor: c.hex }}
                    className="h-10 w-10 rounded-full border border-border transition hover:ring-2 hover:ring-foreground hover:ring-offset-2 hover:ring-offset-background"
                  />
                  <span className="w-full truncate text-[11px] leading-tight text-muted-foreground">{c.label}</span>
                </button>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={() => assignColor(null)}>
              Sirve para todos los colores
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAsk((prev) => prev.slice(1))}
            >
              Descartar esta foto
            </Button>
          </DialogContent>
        </Dialog>



        <Button type="submit" className="w-full" disabled={saving}>
          <Plus className="h-4 w-4" />
          {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
        </Button>
      </form>
    </div>
  );
}

/** Caja de fotos de un solo color (o de las generales). Máximo 10 por caja. */
function PhotoBox({
  title,
  hex,
  note,
  images,
  onUpload,
  onDelete,
}: {
  title: string;
  hex?: string;
  note?: string;
  images: ProductImage[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const remaining = 10 - images.length;

  const handleFiles = async (fs: File[]) => {
    const imgs = fs.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    if (remaining <= 0) {
      toast.error(`Esta caja ya tiene 10 fotos. Borra alguna para subir otra.`);
      return;
    }
    setBusy(true);
    try {
      await onUpload(imgs.slice(0, remaining));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      tabIndex={0}
      className="space-y-2 rounded-xl border border-border p-3 focus:outline-none focus:ring-1 focus:ring-ring"
      onPaste={(e) => {
        const fs = Array.from(e.clipboardData?.files ?? []);
        if (fs.length) {
          e.preventDefault();
          e.stopPropagation();
          void handleFiles(fs);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fs = Array.from(e.dataTransfer?.files ?? []);
        if (fs.length) void handleFiles(fs);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {hex && (
            <span
              style={{ backgroundColor: hex }}
              className="h-5 w-5 shrink-0 rounded-full border border-border"
            />
          )}
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {images.length} de 10
        </span>
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <span key={img.id} className="relative min-w-0">
                <img
                  src={img.image_url}
                  alt=""
                  className="aspect-square w-full rounded-lg border border-border object-cover"
                />
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      aria-label="Eliminar imagen"
                      className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  }
                  title="¿Eliminar esta imagen?"
                  description="La foto se quitará de la galería del producto de forma permanente."
                  confirmLabel="Sí, eliminar"
                  onConfirm={() => onDelete(img.id)}
                />
              </span>
            ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files ?? []);
          if (fs.length) void handleFiles(fs);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy || remaining <= 0}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {busy ? "Subiendo..." : remaining <= 0 ? "Caja llena" : "Subir fotos"}
      </Button>
      {remaining > 0 && !busy && (
        <p className="text-[11px] text-muted-foreground">
          También puedes arrastrar las fotos aquí o pegarlas con Ctrl+V (haz clic primero en esta
          caja).
        </p>
      )}
    </div>
  );
}
