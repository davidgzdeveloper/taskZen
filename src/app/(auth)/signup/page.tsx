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

export default function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      const result = await signUp(email, password, fullName);

      if (result.error) {
        toast({
          title: "No se pudo crear la cuenta",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cuenta creada",
          description: "Crea tu primera tarea y estima cuántos Pomodoros te llevará.",
        });
        router.push('/dashboard');
      }
    } catch (err) {
      toast({
        title: "No se pudo crear la cuenta",
        description: "El servidor no respondió. Comprueba tu conexión e inténtalo de nuevo.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const totalLoading = isLoading || loading;

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Crear cuenta</h1>
      <p className="mt-2 text-muted-foreground">Es gratis y solo te pedimos tres datos.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Nombre</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Ana García"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={totalLoading}
            className="h-11"
          />
        </div>
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
          <Input id="password" type="password" autoComplete="new-password" required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={totalLoading}
            className="h-11"
          />
        </div>
        <Button type="submit" className="h-11 w-full text-base" disabled={totalLoading}>
          {totalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
