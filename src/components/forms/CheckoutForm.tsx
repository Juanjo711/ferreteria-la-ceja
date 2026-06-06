"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { createOrder } from "@/app/actions/checkout";
import { useCartStore } from "@/lib/cart-store";
import { calculateCartTotals } from "@/lib/pricing";
import { formatCOP } from "@/lib/format";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Props = {
  defaults: {
    fullName: string;
    phone: string | null;
  };
};

/**
 * Form de checkout en una sola pantalla con 3 secciones:
 *   1) Dirección de envío (con defaults sensatos para La Ceja).
 *   2) Método de pago simulado (radio + subform decorativo).
 *   3) Resumen sticky + botón "Confirmar pedido".
 *
 * Al confirmar:
 *   - llama createOrder (server action)
 *   - tras éxito limpia el store local y navega a /pedidos/[X]/confirmacion
 *   - tras error muestra mensaje global o stockIssues con links al carrito
 */
export function CheckoutForm({ defaults }: Props) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const replaceFromServer = useCartStore((s) => s.replaceFromServer);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formError, setFormError] = useState<string | null>(null);
  const [stockIssues, setStockIssues] = useState<
    Array<{ productId: string; name: string; available: number; requested: number }> | null
  >(null);
  const [isPending, startTransition] = useTransition();
  // Tras submit exitoso, el carrito se vacía (replaceFromServer([])). El
  // efecto "redirect si vacío" no debe correr en ese caso porque ya estamos
  // navegando a /pedidos/[N]/confirmacion.
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        nombre: defaults.fullName,
        telefono: defaults.phone ?? "",
        direccion: "",
        ciudad: "La Ceja",
        departamento: "Antioquia",
        notas: "",
      },
      paymentMethod: "simulated_card",
    },
    mode: "onTouched",
  });

  const paymentMethod = watch("paymentMethod");

  const totals = useMemo(
    () => calculateCartTotals(mounted ? items : []),
    [mounted, items],
  );

  // Si el carrito quedó vacío tras un cambio o limpieza, devolver a /carrito.
  // Excluye el caso post-submit (ya estamos navegando a confirmación).
  useEffect(() => {
    if (mounted && !submitted && items.length === 0) {
      router.replace("/carrito");
    }
  }, [mounted, submitted, items.length, router]);

  async function onSubmit(values: CheckoutInput) {
    setFormError(null);
    setStockIssues(null);
    const result = await createOrder(values);
    if (!result.ok) {
      if (result.stockIssues) setStockIssues(result.stockIssues);
      if (result.formError) setFormError(result.formError);
      return;
    }
    // Marcar como submitted ANTES de vaciar el carrito, para que el efecto
    // de redirect-si-vacío no compita con nuestro router.replace.
    setSubmitted(true);
    replaceFromServer([]);
    startTransition(() => {
      router.replace(`/pedidos/${result.orderNumber}/confirmacion`);
    });
  }

  const submitDisabled = isSubmitting || isPending || items.length === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-10 gap-10">
      <div className="lg:col-span-7 space-y-10">
        {/* Errores globales */}
        {formError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2"
          >
            <Icon name="error" size={18} />
            {formError}
          </div>
        )}
        {stockIssues && stockIssues.length > 0 && (
          <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm">
            <p className="font-bold mb-2">Productos con problemas de stock:</p>
            <ul className="list-disc pl-5 space-y-1">
              {stockIssues.map((s) => (
                <li key={s.productId}>
                  <strong>{s.name}</strong>: pediste {s.requested}, disponible {s.available}
                </li>
              ))}
            </ul>
            <Link
              href="/carrito"
              className="inline-flex items-center gap-1 mt-3 underline font-semibold"
            >
              <Icon name="arrow_back" size={16} /> Volver al carrito a ajustar
            </Link>
          </div>
        )}

        {/* 1. Dirección */}
        <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-circle bg-primary-container text-white font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-xl font-bold font-headline">Dirección de envío</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              label="Nombre completo"
              error={errors.shippingAddress?.nombre?.message}
              {...register("shippingAddress.nombre")}
            />
            <FormField
              label="Teléfono"
              type="tel"
              error={errors.shippingAddress?.telefono?.message}
              {...register("shippingAddress.telefono")}
            />
            <div className="md:col-span-2">
              <FormField
                label="Dirección"
                placeholder="Calle 19 # 20-30, apto 301"
                error={errors.shippingAddress?.direccion?.message}
                {...register("shippingAddress.direccion")}
              />
            </div>
            <FormField
              label="Ciudad"
              error={errors.shippingAddress?.ciudad?.message}
              {...register("shippingAddress.ciudad")}
            />
            <FormField
              label="Departamento"
              error={errors.shippingAddress?.departamento?.message}
              {...register("shippingAddress.departamento")}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-on-surface-variant">
                Notas para el envío (opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Punto de referencia, horario de entrega, etc."
                {...register("shippingAddress.notas")}
                className="w-full bg-surface-container-low border-none rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* 2. Método de pago */}
        <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 border border-outline-variant/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-circle bg-primary-container text-white font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-xl font-bold font-headline">Método de pago</h2>
          </div>
          <p className="text-xs text-on-surface-variant/70 mb-6 ml-11">
            <Icon name="info" size={12} className="inline mr-1" />
            Pago <strong>simulado</strong> para fines académicos. No se procesa ninguna transacción real ni se almacenan datos sensibles.
          </p>
          <div className="space-y-3">
            <PaymentOption
              value="simulated_card"
              label="Tarjeta de crédito/débito (simulada)"
              icon="credit_card"
              checked={paymentMethod === "simulated_card"}
              register={register("paymentMethod")}
            />
            {paymentMethod === "simulated_card" && (
              <fieldset className="border border-outline-variant/30 rounded-lg p-4 ml-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-surface-container-low">
                <input
                  placeholder="Número de tarjeta (decorativo)"
                  className="w-full bg-white rounded px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none md:col-span-2"
                  autoComplete="off"
                />
                <input
                  placeholder="MM/AA"
                  className="w-full bg-white rounded px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none"
                  autoComplete="off"
                />
                <input
                  placeholder="CVV"
                  className="w-full bg-white rounded px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none"
                  autoComplete="off"
                />
                <input
                  placeholder="Nombre del titular"
                  className="w-full bg-white rounded px-3 py-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none md:col-span-2"
                  autoComplete="off"
                />
              </fieldset>
            )}

            <PaymentOption
              value="simulated_pse"
              label="PSE (simulado)"
              icon="account_balance"
              checked={paymentMethod === "simulated_pse"}
              register={register("paymentMethod")}
            />
            {paymentMethod === "simulated_pse" && (
              <div className="ml-6">
                <select className="bg-white rounded px-3 py-2 text-sm border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none">
                  <option>Selecciona tu banco (decorativo)</option>
                  <option>Bancolombia</option>
                  <option>Banco de Bogotá</option>
                  <option>Davivienda</option>
                  <option>BBVA</option>
                  <option>Banco Popular</option>
                </select>
              </div>
            )}

            <PaymentOption
              value="cash_on_delivery"
              label="Contraentrega"
              icon="payments"
              checked={paymentMethod === "cash_on_delivery"}
              register={register("paymentMethod")}
            />
          </div>
        </section>
      </div>

      {/* 3. Resumen */}
      <aside className="lg:col-span-3">
        <div className="bg-surface-container-low rounded-2xl p-6 sticky top-24 shadow-sm space-y-4">
          <h2 className="font-headline font-bold text-lg flex items-center gap-3">
            <span className="w-8 h-8 rounded-circle bg-primary-container text-white font-bold flex items-center justify-center text-sm">
              3
            </span>
            Resumen del pedido
          </h2>

          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {mounted &&
              items.map((it) => (
                <li key={it.productId} className="flex justify-between gap-3">
                  <span className="text-on-surface truncate">
                    <span className="text-on-surface-variant/60">{it.quantity}×</span> {it.name}
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    {formatCOP(it.price * it.quantity)}
                  </span>
                </li>
              ))}
          </ul>
          <div className="h-px bg-outline-variant/30" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Subtotal</span>
              <span className="font-semibold">{formatCOP(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Envío</span>
              <span
                className={
                  totals.freeShipping ? "font-semibold text-tertiary" : "font-semibold"
                }
              >
                {totals.freeShipping ? "Gratis" : formatCOP(totals.shippingCost)}
              </span>
            </div>
          </div>
          <div className="h-px bg-outline-variant/30" />
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold">TOTAL</span>
            <span className="text-2xl font-extrabold text-primary-container">
              {formatCOP(totals.total)}
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={submitDisabled}
          >
            <Icon name="shopping_bag" />
            {isPending || isSubmitting ? "Procesando..." : "CONFIRMAR PEDIDO"}
          </Button>
          <p className="text-xs text-secondary text-center">
            Al confirmar aceptas las condiciones de uso del sitio.
          </p>
        </div>
      </aside>
    </form>
  );
}

function PaymentOption({
  value,
  label,
  icon,
  checked,
  register,
}: {
  value: string;
  label: string;
  icon: string;
  checked: boolean;
  register: UseFormRegisterReturn<"paymentMethod">;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
        checked
          ? "border-primary-container bg-primary-fixed/20"
          : "border-outline-variant/30 hover:border-primary-container/60",
      )}
    >
      <input
        type="radio"
        value={value}
        {...register}
        className="w-4 h-4 text-primary focus:ring-primary"
      />
      <Icon name={icon} className={checked ? "text-primary" : "text-on-surface-variant/70"} />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
