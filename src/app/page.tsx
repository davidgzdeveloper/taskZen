
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttChartSquare, Timer, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <GanttChartSquare className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">TaskZen</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/login" prefetch={false}>Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup" prefetch={false}>Registrarse</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-56 text-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Organiza Tu Vida, Alcanza Tus Metas
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                TaskZen es la herramienta definitiva para la productividad y la gestión de tareas. Deja de hacer malabares con las aplicaciones y empieza a centrarte en lo que de verdad importa.
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                <Button asChild size="lg">
                  <Link href="/signup" prefetch={false}>Empieza Gratis</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">¿Te Sientes Abrumado?</h2>
              <p className="text-lg text-muted-foreground">
                Tienes metas ambiciosas, pero tu lista de tareas es un caos. Estás cansado de cambiar entre calendarios, aplicaciones para tomar notas y temporizadores, perdiendo el enfoque y el impulso por el camino. ¿Te suena familiar?
              </p>
            </div>
          </div>
        </section>

        {/* Solution/Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                La Solución
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tu Centro de Productividad Todo en Uno</h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed">
                TaskZen aporta claridad y enfoque a tu flujo de trabajo combinando las mejores herramientas de productividad en una experiencia única y fluida.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <GanttChartSquare className="w-8 h-8 text-primary" />
                  <CardTitle>Tablero Kanban Visual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Visualiza tu flujo de trabajo, arrastra y suelta tareas y observa cómo avanza tu progreso. Perfecto para gestionar proyectos complejos con facilidad.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Timer className="w-8 h-8 text-primary" />
                  <CardTitle>Temporizador Pomodoro Integrado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Aumenta tu concentración y evita el agotamiento con el temporizador Pomodoro incorporado. Trabaja en sprints concentrados para obtener la máxima eficiencia.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChart className="w-8 h-8 text-primary" />
                  <CardTitle>Analíticas Detalladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Realiza un seguimiento de tu actividad, comprende tus patrones de trabajo y obtén información valiosa para optimizar tu productividad a lo largo del tiempo.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container text-center px-4 md:px-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">¿Listo para Tomar el Control?</h2>
              <p className="text-muted-foreground">
                Regístrate gratis y comienza tu viaje hacia una vida más organizada y productiva. No se requiere tarjeta de crédito.
              </p>
              <Button asChild size="lg">
                <Link href="/signup" prefetch={false}>Regístrate Ahora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 TaskZen. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
