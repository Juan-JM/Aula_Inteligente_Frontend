import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { DashboardStats } from "@/types/api"

interface PerformanceChartProps {
  data: DashboardStats["performance_data"]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Rendimiento Académico</CardTitle>
        <CardDescription>Comparación entre rendimiento predicho vs real</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Predicho"
              strokeDasharray="5 5"
            />
            <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Real" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
