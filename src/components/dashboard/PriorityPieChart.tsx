"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Task } from "@/lib/types";
import { useMemo } from "react";

const COLORS = {
  high: "hsl(var(--destructive))",
  medium: "hsl(var(--accent))",
  low: "hsl(var(--primary))",
};

interface PriorityPieChartProps {
  tasks: Task[];
}

export function PriorityPieChart({ tasks }: PriorityPieChartProps) {
    const data = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        tasks.forEach(task => {
            counts[task.priority]++;
        });
        return [
            { name: 'High', value: counts.high, fill: COLORS.high },
            { name: 'Medium', value: counts.medium, fill: COLORS.medium },
            { name: 'Low', value: counts.low, fill: COLORS.low },
        ].filter(item => item.value > 0);
    }, [tasks]);

  if(data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
                <CardDescription>No tasks to display.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Add some tasks to see the chart.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-64 w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
