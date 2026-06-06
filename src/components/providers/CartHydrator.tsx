"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import type { CartItemView } from "@/types/cart";

/**
 * Sincroniza el carrito local con la sesión de NextAuth.
 *
 * Flujo:
 *   - Mientras unauthenticated: store en modo "anon", items en localStorage.
 *   - Al autenticarse:
 *       1. setMode("auth")
 *       2. POSTea cada item local a /api/cart/items (merge aditivo)
 *       3. GET /api/cart para reemplazar con la versión canónica
 *       4. setHydrated(true) → mutaciones siguientes van a DB
 *   - Al desloguearse: setMode("anon"), hydrated=false. Conservamos los items
 *     locales (puede que el usuario quiera seguir comprando como invitado).
 *
 * Idempotente: usa refs para no re-correr si la sesión no cambió.
 */
export function CartHydrator() {
  const { status } = useSession();
  const setMode = useCartStore((s) => s.setMode);
  const setHydrated = useCartStore((s) => s.setHydrated);
  const replaceFromServer = useCartStore((s) => s.replaceFromServer);

  const lastStatus = useRef<typeof status | null>(null);

  useEffect(() => {
    if (status === lastStatus.current) return;
    lastStatus.current = status;

    if (status === "loading") return;

    if (status === "unauthenticated") {
      setMode("anon");
      setHydrated(false);
      return;
    }

    // status === "authenticated"
    setMode("auth");

    (async () => {
      // 1) Merge: tomamos el snapshot actual de items locales y los postea
      //    uno por uno. El server suma cantidades si el item ya existe.
      const localItems = useCartStore.getState().items;
      for (const item of localItems) {
        try {
          await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
            }),
          });
        } catch (e) {
          console.warn("[cart] merge falló para", item.productId, e);
        }
      }

      // 2) Pedir versión canónica al server y reemplazar.
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { items: CartItemView[] };
        replaceFromServer(data.items);
      } catch (e) {
        console.error("[cart] hidratación inicial falló:", e);
        // Aún en error marcamos como hidratado para no quedar en limbo.
        setHydrated(true);
      }
    })();
  }, [status, setMode, setHydrated, replaceFromServer]);

  return null;
}
