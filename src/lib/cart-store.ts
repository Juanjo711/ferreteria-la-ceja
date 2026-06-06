"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItemView } from "@/types/cart";

/**
 * Store del carrito (Zustand).
 *
 * Dos modos:
 *   - "anon": el carrito vive 100% en localStorage. Las mutaciones son locales.
 *   - "auth": el carrito canónico vive en DB. Cada mutación dispara una llamada
 *             API; el éxito reemplaza el local con la respuesta del servidor
 *             (única fuente de verdad). En fallo, hacemos rollback.
 *
 * `hydrated` indica que ya completamos la primera sincronización con el
 * servidor desde que se entró en modo "auth"; antes de eso, las acciones
 * locales no llaman a la API para no carrear con un estado vacío.
 */

type Mode = "anon" | "auth";

type CartState = {
  items: CartItemView[];
  mode: Mode;
  hydrated: boolean;
  /** True mientras alguna mutación está in-flight (para deshabilitar UI). */
  syncing: boolean;
  setMode: (mode: Mode) => void;
  setHydrated: (value: boolean) => void;
  replaceFromServer: (items: CartItemView[]) => void;
  add: (
    item: Omit<CartItemView, "quantity">,
    quantity?: number,
  ) => Promise<{ ok: boolean; error?: string }>;
  setQuantity: (productId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  remove: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  clear: () => Promise<{ ok: boolean; error?: string }>;
  totalQuantity: () => number;
};

// =====================================================================
// Helpers internos
// =====================================================================

function clamp(qty: number, max: number): number {
  if (qty < 1) return 1;
  if (qty > max) return max;
  return qty;
}

function mergeAdd(
  items: CartItemView[],
  newItem: Omit<CartItemView, "quantity">,
  quantity: number,
): CartItemView[] {
  const existing = items.find((i) => i.productId === newItem.productId);
  if (existing) {
    const nextQty = clamp(existing.quantity + quantity, newItem.stock);
    return items.map((i) =>
      i.productId === newItem.productId
        ? { ...i, ...newItem, quantity: nextQty }
        : i,
    );
  }
  return [...items, { ...newItem, quantity: clamp(quantity, newItem.stock) }];
}

async function postJson<T>(
  url: string,
  body: unknown,
  method: "POST" | "PATCH" | "DELETE" = "POST",
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "DELETE" && body === undefined ? undefined : JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

type ServerCartResponse = { items: CartItemView[] };

// =====================================================================
// Store
// =====================================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      mode: "anon",
      hydrated: false,
      syncing: false,

      setMode: (mode) => set({ mode }),
      setHydrated: (value) => set({ hydrated: value }),
      replaceFromServer: (items) => set({ items, hydrated: true }),

      totalQuantity: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      add: async (item, quantity = 1) => {
        const previous = get().items;
        const next = mergeAdd(previous, item, quantity);
        set({ items: next });

        if (get().mode === "auth" && get().hydrated) {
          set({ syncing: true });
          try {
            const data = await postJson<ServerCartResponse>("/api/cart/items", {
              productId: item.productId,
              quantity,
            });
            set({ items: data.items, syncing: false });
            return { ok: true };
          } catch (e) {
            console.error("[cart] add fallo:", e);
            set({ items: previous, syncing: false });
            return { ok: false, error: "No pudimos agregar este producto. Inténtalo de nuevo." };
          }
        }
        return { ok: true };
      },

      setQuantity: async (productId, quantity) => {
        const previous = get().items;
        const existing = previous.find((i) => i.productId === productId);
        if (!existing) return { ok: false, error: "Producto no está en el carrito" };

        if (quantity <= 0) return get().remove(productId);

        const newQty = clamp(quantity, existing.stock);
        const next = previous.map((i) =>
          i.productId === productId ? { ...i, quantity: newQty } : i,
        );
        set({ items: next });

        if (get().mode === "auth" && get().hydrated) {
          set({ syncing: true });
          try {
            const data = await postJson<ServerCartResponse>(
              `/api/cart/items/${productId}`,
              { quantity: newQty },
              "PATCH",
            );
            set({ items: data.items, syncing: false });
            return { ok: true };
          } catch (e) {
            console.error("[cart] setQuantity fallo:", e);
            set({ items: previous, syncing: false });
            return { ok: false, error: "No pudimos actualizar la cantidad." };
          }
        }
        return { ok: true };
      },

      remove: async (productId) => {
        const previous = get().items;
        const next = previous.filter((i) => i.productId !== productId);
        set({ items: next });

        if (get().mode === "auth" && get().hydrated) {
          set({ syncing: true });
          try {
            const data = await postJson<ServerCartResponse>(
              `/api/cart/items/${productId}`,
              undefined,
              "DELETE",
            );
            set({ items: data.items, syncing: false });
            return { ok: true };
          } catch (e) {
            console.error("[cart] remove fallo:", e);
            set({ items: previous, syncing: false });
            return { ok: false, error: "No pudimos eliminar el producto." };
          }
        }
        return { ok: true };
      },

      clear: async () => {
        const previous = get().items;
        set({ items: [] });

        if (get().mode === "auth" && get().hydrated) {
          set({ syncing: true });
          try {
            const data = await postJson<ServerCartResponse>(
              "/api/cart",
              undefined,
              "DELETE",
            );
            set({ items: data.items, syncing: false });
            return { ok: true };
          } catch (e) {
            console.error("[cart] clear fallo:", e);
            set({ items: previous, syncing: false });
            return { ok: false, error: "No pudimos vaciar el carrito." };
          }
        }
        return { ok: true };
      },
    }),
    {
      name: "flc-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos items (y el modo no, porque depende de la sesión actual).
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
