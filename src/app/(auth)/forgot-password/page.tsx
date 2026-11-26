"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No pudimos enviar el correo. Inténtalo de nuevo.");
      setSentTo(email.trim());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div>
        <MailCheck className="h-8 w-8 text-done" aria-hidden />
        <h1 className="mt-4 text-4xl font-extrabold">Revisa tu correo</h1>
        <p className="mt-3 text-muted-foreground">
          Si <span className="font-medium text-foreground">{sentTo}</span> tiene una cuenta, te hemos enviado un
          enlace para elegir una contraseña nueva. Caduca en 1 hora.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          ¿No llega? Mira en spam o{" "}
          <button type="button" onClick={() => setSentTo(null)} className="font-medium text-primary underline-offset-4 hover:underline">
            vuelve a intentarlo
          </button>{" "}
          dentro de un minuto.
        </p>
        <p className="mt-8 text-sm">
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Recuperar contraseña</h1>
      <p className="mt-2 text-muted-foreground">Te enviaremos un enlace para elegir una nueva.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar enlace
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        ¿La recordaste?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
