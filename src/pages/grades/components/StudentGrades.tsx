"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { gradesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StudentGradesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ci_estudiante: string | null
}

interface StudentGradeData {
  estudiante: {
    ci: string
    nombre: string
    apellido: string
    email: string
  }
  curso_actual: {
    codigo: string
    nombre: string
    nivel: string
    paralelo: string
    gestion: number
  }
  rendimiento_por_materia: Record<
    string,
    {
      materia_codigo: string
      docente: string
      notas: Array<{
        criterio: string
        nota: number
        fecha: string
      }>
      promedio_notas: number
      porcentaje_asistencia: number
      promedio_participacion: number
    }
  >
}

export function StudentGrades({ open, onOpenChange, ci_estudiante }: StudentGradesProps) {
  const [studentData, setStudentData] = useState<StudentGradeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && ci_estudiante) {
      fetchStudentGrades()
    }
  }, [open, ci_estudiante])

  const fetchStudentGrades = async () => {
    if (!ci_estudiante) return

    setIsLoading(true)
    try {
      const response = await gradesApi.getStudentPerformance(ci_estudiante)
      setStudentData(response)
    } catch (error) {
      console.error("Error fetching student grades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (nota: number) => {
    if (nota >= 70) return "default"
    if (nota >= 50) return "secondary"
    return "destructive"
  }

  const getGradeIcon = (nota: number) => {
    if (nota >= 70) return <TrendingUp className="h-4 w-4" />
    if (nota >= 50) return <Minus className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const calculateOverallAverage = () => {
    if (!studentData) return 0
    const materias = Object.values(studentData.rendimiento_por_materia)
    if (materias.length === 0) return 0
    const sum = materias.reduce((acc, materia) => acc + materia.promedio_notas, 0)
    return sum / materias.length
  }

  if (!studentData && !isLoading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rendimiento Académico del Estudiante</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Cargando información...</div>
          </div>
        ) : studentData ? (
          <div className="space-y-6">
            {/* Información del Estudiante */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {studentData.estudiante.nombre} {studentData.estudiante.apellido}
                </CardTitle>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>CI: {studentData.estudiante.ci}</span>
                  <span>•</span>
                  <span>{studentData.curso_actual.nombre}</span>
                  <span>•</span>
                  <span>Promedio General: {calculateOverallAverage().toFixed(1)}</span>
                </div>
              </CardHeader>
            </Card>

            {/* Rendimiento por Materia */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="details">Detalles por Materia</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(studentData.rendimiento_por_materia).map(([materia, data]) => (
                    <Card key={materia}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{materia}</CardTitle>
                        <div className="text-sm text-muted-foreground">Docente: {data.docente}</div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Promedio</span>
                          <div className="flex items-center gap-2">
                            {getGradeIcon(data.promedio_notas)}
                            <Badge variant={getGradeColor(data.promedio_notas)}>{data.promedio_notas.toFixed(1)}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Asistencia</span>
                            <span>{data.porcentaje_asistencia.toFixed(1)}%</span>
                          </div>
                          <Progress value={data.porcentaje_asistencia} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Participación</span>
                            <span>{data.promedio_participacion.toFixed(1)}/5.0</span>
                          </div>
                          <Progress value={(data.promedio_participacion / 5) * 100} className="h-2" />
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {data.notas.length} calificaciones registradas
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {Object.entries(studentData.rendimiento_por_materia).map(([materia, data]) => (
                  <Card key={materia}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{materia}</span>
                        <Badge variant={getGradeColor(data.promedio_notas)}>
                          Promedio: {data.promedio_notas.toFixed(1)}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">Docente: {data.docente}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium">Calificaciones</h4>
                        <div className="grid gap-2">
                          {data.notas.map((nota, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm">{nota.criterio}</div>
                                <div className="text-xs text-muted-foreground">{formatDate(nota.fecha)}</div>
                              </div>
                              <Badge variant={getGradeColor(nota.nota)}>{nota.nota.toFixed(1)}</Badge>
                            </div>
                          ))}
                        </div>

                        {data.notas.length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            No hay calificaciones registradas
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No se pudo cargar la información del estudiante</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
