import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getProducts,
  updateCategory,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/categorias")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory(name.trim());
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría creada");
      setName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la categoría");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: number, current: string) => {
    setEditingId(id);
    setEditingName(current);
  };

  const saveEdit = async (id: number) => {
    const newName = editingName.trim();
    if (newName.length < 2) return;
    setBusyId(id);
    try {
      await updateCategory(id, newName);
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Nombre actualizado");
      setEditingId(null);
    } catch (err) {
      // La API puede responder 409 si el nombre ya existe: mostramos su mensaje tal cual.
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el nombre");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await deleteCategory(id);
      await qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría eliminada");
    } catch (err) {
      // 409: la categoría tiene productos. El mensaje de la API explica qué hacer.
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la categoría");
    } finally {
      setBusyId(null);
    }
  };

  const countFor = (id: number) => (products ?? []).filter((p) => p.category?.id === id).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="card-surface h-fit space-y-4 p-5">
        <h2 className="font-display text-lg font-bold">Nueva categoría</h2>
        <div className="space-y-1.5">
          <Label htmlFor="c-name">Nombre</Label>
          <Input
            id="c-name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Morrales, Bolsos, Accesorios..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={saving || name.trim().length < 2}>
          <Plus className="h-4 w-4" />
          {saving ? "Creando..." : "Crear categoría"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Los productos deben tener una categoría asignada para poder crearse.
        </p>
      </form>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">
          Categorías ({categories?.length ?? 0})
        </h2>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !categories?.length ? (
          <div className="card-surface flex flex-col items-center gap-2 p-10 text-center">
            <Tags className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aún no has creado categorías.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="card-surface flex items-center gap-3 p-4">
                {editingId === c.id ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit(c.id);
                    }}
                  >
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      minLength={2}
                      maxLength={100}
                      autoFocus
                      className="h-9"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      disabled={busyId === c.id || editingName.trim().length < 2}
                      aria-label="Guardar nombre"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar edición"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-medium capitalize">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {countFor(c.id)} {countFor(c.id) === 1 ? "producto" : "productos"}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(c.id, c.name)}
                      aria-label={`Editar nombre de ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Eliminar ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      }
                      title={`¿Eliminar la categoría ${c.name}?`}
                      description="Esta acción no se puede deshacer."
                      confirmLabel="Eliminar"
                      onConfirm={() => remove(c.id)}
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
