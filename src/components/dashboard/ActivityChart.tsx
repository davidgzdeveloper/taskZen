"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig, ChartContainer } from "@/components/ui/chart"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

const chartConfig = {
  tasksCompleted: {
    label: "Tareas",
    color: "hsl(var(--chart-tasks))",
  },
  pomodorosCompleted: {
    label: "Pomodoros",
    color: "hsl(var(--chart-pomodoros))",
  },
} satisfies ChartConfig

interface ActivityChartProps {
  data: {
    date: string
    tasksCompleted: number
    pomodorosCompleted: number
  }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), "d MMM", { locale: es }),
  }));

  return (
    <section aria-labelledby="activity-title" className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 id="activity-title" className="text-xl font-semibold">Actividad</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tareas terminadas y sus Pomodoros, por día de cierre.</p>
      {chartData.length === 0 ? (
        <p className="flex h-64 items-center text-muted-foreground">
          No terminaste ninguna tarea en estas fechas. Prueba con un rango más amplio.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 h-72 w-full">
          <LineChart data={chartData} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="0" className="stroke-border" />
            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip cursor={{ strokeWidth: 1 }} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="tasksCompleted" stroke="var(--color-tasksCompleted)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="pomodorosCompleted" stroke="var(--color-pomodorosCompleted)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      )}
    </section>
  )
}
