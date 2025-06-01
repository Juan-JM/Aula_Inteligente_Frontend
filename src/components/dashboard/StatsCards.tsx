import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, School, TrendingUp } from "lucide-react"
import type { DashboardStats } from "@/types/api"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Estudiantes",
      value: stats.total_students.toLocaleString(),
      icon: GraduationCap,
      description: "Estudiantes activos",
    },
    {
      title: "Promedio General",
      value: `${stats.average_grade.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Promedio de calificaciones",
    },
    {
      title: "Asistencia",
      value: `${stats.attendance_percentage.toFixed(1)}%`,
      icon: Users,
      description: "Porcentaje de asistencia",
    },
    {
      title: "Total Cursos",
      value: stats.total_courses.toString(),
      icon: School,
      description: "Cursos activos",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
