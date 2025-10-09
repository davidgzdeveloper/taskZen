import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, GanttChartSquare, Timer, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <GanttChartSquare className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">TaskZen</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Button asChild>
            <Link href="/signup" prefetch={false}>Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-56 text-center">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Organize Your Life, Achieve Your Goals
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                TaskZen is the ultimate tool for productivity and task management. Stop juggling apps and start focusing on what truly matters.
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                <Button asChild size="lg">
                  <Link href="/signup" prefetch={false}>Get Started for Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Feeling Overwhelmed?</h2>
              <p className="text-lg text-muted-foreground">
                You have ambitious goals, but your to-do list is a chaotic mess. You're tired of switching between calendars, note-taking apps, and timers, losing focus and momentum along the way. Sound familiar?
              </p>
            </div>
          </div>
        </section>

        {/* Solution/Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                The Solution
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Your All-in-One Productivity Hub</h2>
              <p className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed">
                TaskZen brings clarity and focus to your workflow by combining the best productivity tools into one seamless experience.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <GanttChartSquare className="w-8 h-8 text-primary" />
                  <CardTitle>Visual Kanban Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Visualize your workflow, drag and drop tasks, and watch your progress unfold. Perfect for managing complex projects with ease.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Timer className="w-8 h-8 text-primary" />
                  <CardTitle>Integrated Pomodoro Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Boost your focus and prevent burnout with the built-in Pomodoro timer. Work in focused sprints for maximum efficiency.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChart className="w-8 h-8 text-primary" />
                  <CardTitle>Insightful Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Track your activity, understand your work patterns, and gain valuable insights to optimize your productivity over time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container text-center px-4 md:px-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Take Control?</h2>
              <p className="text-muted-foreground">
                Sign up for free and start your journey to a more organized and productive life. No credit card required.
              </p>
              <Button asChild size="lg">
                <Link href="/signup" prefetch={false}>Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 TaskZen. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}