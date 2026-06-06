"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/app/actions/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

/**
 * Registro con react-hook-form + Zod + Server Action.
 *
 * Flujo:
 *   1. Validamos con Zod en cliente (DX inmediata).
 *   2. Llamamos registerAction; si devuelve fieldErrors, los pintamos.
 *   3. Si éxito, hacemos signIn auto-login para que la sesión quede activa
 *      sin pedirle al usuario que vuelva a entrar.
 */
export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true, // RHF arranca en false; Zod exige true al validar
    },
    mode: "onTouched",
  });

  const passwordWatched = watch("password") ?? "";

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const res = await registerAction(values);
    if (!res.ok) {
      if (res.fieldErrors) {
        for (const [field, message] of Object.entries(res.fieldErrors)) {
          if (message) setError(field as keyof RegisterInput, { message });
        }
      }
      if (res.formError) setFormError(res.formError);
      return;
    }

    // Auto-login. Hacemos signIn DOS veces:
    //   1) probe con redirect:false — establece el csrf cookie y verifica
    //      que las credenciales recién creadas funcionan.
    //   2) redirect:true — server-side redirect a /cuenta con cookie ya
    //      cuajada en la siguiente request (evita race Set-Cookie).
    const probe = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!probe || probe.error) {
      setFormError("La cuenta se creó pero no pudimos iniciar sesión automáticamente. Inicia sesión manualmente.");
      return;
    }
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      callbackUrl: "/cuenta",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2"
        >
          <Icon name="error" size={18} />
          {formError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          label="Nombre completo"
          placeholder="Juan Pérez"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FormField
          label="Teléfono (opcional)"
          type="tel"
          placeholder="+57 300 000 0000"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <FormField
        label="Correo electrónico"
        type="email"
        placeholder="juan@ejemplo.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div>
        <FormField
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres con mayúscula y número"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={passwordWatched} />
      </div>
      <FormField
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div className="flex items-start gap-3 py-2">
        <input
          id="terms"
          type="checkbox"
          className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
          {...register("terms")}
        />
        <label htmlFor="terms" className="text-xs text-secondary leading-relaxed">
          Acepto los{" "}
          <Link href="#" className="text-primary hover:underline">
            Términos y Condiciones
          </Link>{" "}
          y la Política de Tratamiento de Datos de Ferretería La Ceja.
        </label>
      </div>
      {errors.terms && (
        <p role="alert" className="text-xs text-error font-semibold">
          {errors.terms.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creando cuenta..." : "REGISTRARME AHORA"}
      </Button>

      <p className="text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
