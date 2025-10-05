"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltipContent, ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useMemo } from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

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
  dateRange: DateRange | undefined
}

export function ActivityChart({ data, dateRange }: ActivityChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const title = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      if (format(dateRange.from, "LLL dd, y") === format(dateRange.to, "LLL dd, y")) {
        return `Activity for ${format(dateRange.from, "LLL dd, y")}`;
      }
      return `Activity from ${format(dateRange.from, "LLL dd, y")} to ${format(dateRange.to, "LLL dd, y")}`;
    }
    return "Activity";
  }, [dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
            <ResponsiveContainer>
                <LineChart data={chartData}>
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
                    <Line type="monotone" dataKey="tasksCompleted" stroke="var(--color-tasksCompleted)" strokeWidth={2} />
                    <Line type="monotone" dataKey="pomodorosCompleted" stroke="var(--color-pomodorosCompleted)" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
