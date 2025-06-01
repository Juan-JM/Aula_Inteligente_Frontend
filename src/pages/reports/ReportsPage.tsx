"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3, Users, GraduationCap, Calendar } from "lucide-react"
import { AcademicReport } from "./components/AcademicReport"
import { AttendanceReport } from "./components/AttendanceReport"
import { ParticipationReport } from "./components/ParticipationReport"
import { StudentReport } from "./components/StudentReport"
import { CustomReport } from "./components/CustomReport"

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null)

  const reportTypes = [
    {
      id: "academic",
      title: "Reporte Académico",
      description: "Calificaciones, promedios y rendimiento académico",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      id: "attendance",
      title: "Reporte de Asistencia",
      description: "Estadísticas de asistencia por curso y estudiante",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: "participation",
      title: "Reporte de Participación",
      description: "Análisis de participación en clase",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      id: "student",
      title: "Reporte por Estudiante",
      description: "Informe completo individual de estudiantes",
      icon: FileText,
      color: "bg-orange-500",
    },
    {
      id: "custom",
      title: "Reporte Personalizado",
      description: "Crear reportes con filtros específicos",
      icon: BarChart3,
      color: "bg-red-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">Genera reportes detallados del sistema académico</p>
        </div>
      </div>

      {!activeReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon
            return (
              <Card
                key={report.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveReport(report.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${report.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{report.description}</p>
                  <Button className="w-full mt-4" variant="outline">
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setActiveReport(null)}>
            ← Volver a Reportes
          </Button>

          {activeReport === "academic" && <AcademicReport />}
          {activeReport === "attendance" && <AttendanceReport />}
          {activeReport === "participation" && <ParticipationReport />}
          {activeReport === "student" && <StudentReport />}
          {activeReport === "custom" && <CustomReport />}
        </div>
      )}
    </div>
  )
}
