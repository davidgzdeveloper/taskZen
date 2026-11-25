import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { PomodoroPips } from "@/components/PomodoroPips";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Link href="/" aria-label="TaskZen, inicio" className="self-start">
          <AppLogo />
        </Link>
        <main className="flex flex-1 items-center">
          <div className="w-full max-w-sm py-12">{children}</div>
        </main>
      </div>
      <aside aria-hidden className="dark relative hidden flex-col justify-end gap-6 overflow-hidden bg-background p-12 text-foreground lg:flex">
        <span className="absolute -right-24 -top-24 aspect-square w-[42rem] rounded-full bg-focus/[0.07] animate-breathe" />
        <span
          className="absolute -right-4 -top-4 aspect-square w-[30rem] rounded-full border border-focus/25 animate-breathe"
          style={{ animationDelay: "-0.6s" }}
        />
        <PomodoroPips done={3} total={4} size="lg" running className="relative" />
        <p className="font-headline relative max-w-md text-5xl font-extrabold leading-[0.95]">
          Una tarea. Veinticinco minutos. Siguiente.
        </p>
        <p className="relative max-w-sm text-muted-foreground">
          Y cuando necesites silencio, el modo zen deja en pantalla solo el reloj y tu tarea.
        </p>
      </aside>
    </div>
  );
}
