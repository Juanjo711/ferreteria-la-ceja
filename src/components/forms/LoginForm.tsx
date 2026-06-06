"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Login con react-hook-form + Zod. Llama a signIn de next-auth con
 * redirect:false para poder mostrar el error de credenciales inline.
 *
 * Tras éxito navega a callbackUrl si vino en la URL (?callbackUrl=/checkout)
 * o a /cuenta por defecto.
 */
export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/cuenta";

  const [showPwd, setShowPwd] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    // Verificamos credenciales primero con redirect:false para mostrar error
    // inline sin abandonar la página si fallan.
    const probe = await signIn("credentials", { ...values, redirect: false });
    if (!probe || probe.error) {
      setFormError("Credenciales inválidas. Verifica tu correo y contraseña.");
      return;
    }
    // Credenciales OK → re-emitimos signIn con redirect server-side al
    // callbackUrl. Esto navega el browser y garantiza que la cookie esté en
    // la siguiente request (evita la carrera Set-Cookie vs router de Next).
    await signIn("credentials", { ...values, callbackUrl });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {formError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-semibold flex items-center gap-2"
        >
          <Icon name="error" size={18} />
          {formError}
        </div>
      )}
      <FormField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="ejemplo@correo.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <div>
        <FormField
          label="Contraseña"
          type={showPwd ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          rightAdornment={
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="text-secondary hover:text-on-surface transition-colors"
            >
              <Icon name={showPwd ? "visibility_off" : "visibility"} />
            </button>
          }
          {...register("password")}
        />
        <div className="text-right mt-2">
          <Link
            href="/cuenta/recuperar"
            className="text-xs text-primary font-semibold hover:underline"
            title="Próximamente"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? "Ingresando..." : "INICIAR SESIÓN"}
      </Button>

      <p className="text-center text-sm text-on-surface-variant">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-primary font-bold hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
