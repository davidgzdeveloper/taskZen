"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltipContent, ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  tasksCompleted: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
  pomodorosCompleted: {
    label: "Pomodoros",
    color: "hsl(var(--accent))",
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
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 Days Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tasksCompleted" fill="var(--color-tasksCompleted)" radius={4} />
                    <Bar dataKey="pomodorosCompleted" fill="var(--color-pomodorosCompleted)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
