"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";


export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        toast({
          title: "No se pudo iniciar sesión",
          description: result.error,
          variant: "destructive",
        });
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toast({
        title: "No se pudo iniciar sesión",
        description: "El servidor no respondió. Comprueba tu conexión e inténtalo de nuevo.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const totalLoading = isLoading || loading;

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Iniciar sesión</h1>
      <p className="mt-2 text-muted-foreground">Vuelve a tu tablero.</p>
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
            disabled={totalLoading}
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="current-password" required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={totalLoading}
            className="h-11"
          />
        </div>
        <Button type="submit" className="h-11 w-full text-base" disabled={totalLoading}>
          {totalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar sesión
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
