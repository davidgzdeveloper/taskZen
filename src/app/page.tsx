import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';
import { HeroDemo } from '@/components/landing/HeroDemo';
import { PomodoroPips } from '@/components/PomodoroPips';
import { ZenPreview } from '@/components/landing/ZenPreview';

const steps = [
  {
    title: 'Planifica en el tablero',
    body: 'Crea tus tareas, estima cuántos Pomodoros te llevará cada una y arrástralas entre Por hacer, En curso y Hecho. Si no sabes por dónde empezar, la IA ordena tu columna Por hacer por urgencia y esfuerzo.',
    visual: (
      <div className="flex flex-col gap-1.5">
        <PomodoroPips done={0} total={3} size="sm" />
        <PomodoroPips done={0} total={5} size="sm" />
        <PomodoroPips done={0} total={2} size="sm" />
      </div>
    ),
  },
  {
    title: 'Enfócate con el temporizador',
    body: 'Elige una tarea y arranca una sesión de 15, 25 o 45 minutos, o entra en modo zen para que no quede nada más en pantalla. Al terminar, el Pomodoro se suma a esa tarea y empieza el descanso.',
    visual: <PomodoroPips done={2} total={4} size="md" running />,
  },
  {
    title: 'Revisa lo que terminaste',
    body: 'El panel muestra las tareas completadas, los Pomodoros de cada día y cómo se reparte tu trabajo por prioridad.',
    visual: <PomodoroPips done={4} total={4} size="md" />,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" aria-label="TaskZen, inicio">
          <AppLogo />
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Crear cuenta</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:pb-28">
          <div className="max-w-xl">
            <h1 className="text-[2.75rem] font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">
              {['Cada tarea,', 'contada en', 'sesiones de foco.'].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span className="block animate-rise" style={{ animationDelay: `${i * 110}ms` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p
              className="mt-6 max-w-[34rem] animate-rise text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: '420ms' }}
            >
              TaskZen junta tu tablero y tu temporizador. Estima cuántos Pomodoros te llevará cada tarea,
              trabaja en ella con el reloj en marcha y ve en el tablero cuánto te falta.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap items-center gap-3" style={{ animationDelay: '540ms' }}>
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/signup">Crear cuenta gratis</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-4 text-base">
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
          <div className="animate-rise" style={{ animationDelay: '650ms' }}>
            <HeroDemo />
          </div>
        </section>

        <section aria-labelledby="como-funciona" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <h2 id="como-funciona" className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl">
              Del plan al trabajo hecho, sin cambiar de app.
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <li key={step.title} className="flex flex-col gap-4">
                  <div className="flex h-12 items-end">{step.visual}</div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="modo-zen" className="dark bg-background text-foreground">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2">
            <div className="max-w-lg">
              <h2 id="modo-zen" className="text-4xl font-extrabold leading-[1] sm:text-5xl">
                Modo zen
              </h2>
              <p className="mt-5 text-xl leading-relaxed text-foreground/90">
                Cuando toca concentrarse, todo lo demás desaparece.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Un clic y el temporizador ocupa toda la pantalla: solo el reloj, tu tarea y un círculo
                que respira contigo. En el descanso te guía al mismo ritmo, cuatro segundos para inhalar
                y cuatro para exhalar. La barra espaciadora pausa y Esc te devuelve al tablero.
              </p>
            </div>
            <ZenPreview />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl text-4xl font-extrabold leading-[1] sm:text-5xl">
              Tu próxima tarea cabe en 25 minutos.
            </h2>
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/signup">Crear cuenta gratis</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} TaskZen</p>
          <p>Hecho para trabajar a ratos de 25 minutos.</p>
        </div>
      </footer>
    </div>
  );
}
