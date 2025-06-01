"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Calendar, TrendingUp, Users } from "lucide-react"
import { attendanceApi, coursesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import type { Course } from "@/types/api"

interface AttendanceReportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AttendanceStats {
  total_estudiantes: number
  total_registros: number
  porcentaje_asistencia_general: number
  asistencia_por_curso: Array<{
    curso: string
    total_estudiantes: number
    porcentaje_asistencia: number
    presentes: number
    ausentes: number
    tardanzas: number
    justificados: number
  }>
  asistencia_por_fecha: Array<{
    fecha: string
    total_registros: number
    porcentaje_asistencia: number
  }>
  estudiantes_con_baja_asistencia: Array<{
    ci_estudiante: string
    nombre_estudiante: string
    curso: string
    porcentaje_asistencia: number
    total_ausencias: number
  }>
}

export function AttendanceReport({ open, onOpenChange }: AttendanceReportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [filters, setFilters] = useState({
    codigo_curso: "",
    fecha_inicio: "",
    fecha_fin: "",
  })

  useEffect(() => {
    if (open) {
      fetchCourses()
      fetchStats()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetchStats()
    }
  }, [filters])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await attendanceApi.getStats(filters)
      setStats(response)
    } catch (error) {
      console.error("Error fetching attendance stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await attendanceApi.exportReport(filters)
      // Crear y descargar archivo
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte_asistencia_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting report:", error)
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Reportes de Asistencia</DialogTitle>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select
                    value={filters.codigo_curso}
                    onValueChange={(value) => setFilters({ ...filters, codigo_curso: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los cursos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los cursos</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.codigo} value={course.codigo}>
                          {course.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={filters.fecha_inicio}
                    onChange={(e) => setFilters({ ...filters, fecha_inicio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={filters.fecha_fin}
                    onChange={(e) => setFilters({ ...filters, fecha_fin: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-lg">Cargando estadísticas...</div>
            </div>
          ) : stats ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="courses">Por Curso</TabsTrigger>
                <TabsTrigger value="timeline">Cronología</TabsTrigger>
                <TabsTrigger value="alerts">Alertas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_estudiantes}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_registros}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Asistencia General</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getAttendanceColor(stats.porcentaje_asistencia_general)}`}>
                        {stats.porcentaje_asistencia_general.toFixed(1)}%
                      </div>
                      <Progress value={stats.porcentaje_asistencia_general} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <div className="grid gap-4">
                  {stats.asistencia_por_curso.map((curso, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{curso.curso}</CardTitle>
                          <Badge variant="outline">{curso.total_estudiantes} estudiantes</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Porcentaje de Asistencia</span>
                            <span className={`font-bold ${getAttendanceColor(curso.porcentaje_asistencia)}`}>
                              {curso.porcentaje_asistencia.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={curso.porcentaje_asistencia} />

                          <div className="grid gap-2 md:grid-cols-4 text-sm">
                            <div className="flex justify-between">
                              <span>Presentes:</span>
                              <Badge variant="default">{curso.presentes}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Ausentes:</span>
                              <Badge variant="destructive">{curso.ausentes}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Tardanzas:</span>
                              <Badge variant="secondary">{curso.tardanzas}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Justificados:</span>
                              <Badge variant="outline">{curso.justificados}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Asistencia por Fecha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.asistencia_por_fecha.map((fecha, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{formatDate(fecha.fecha)}</div>
                            <div className="text-sm text-muted-foreground">{fecha.total_registros} registros</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getAttendanceColor(fecha.porcentaje_asistencia)}`}>
                              {fecha.porcentaje_asistencia.toFixed(1)}%
                            </div>
                            <Progress value={fecha.porcentaje_asistencia} className="w-20 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estudiantes con Baja Asistencia</CardTitle>
                    <div className="text-sm text-muted-foreground">Estudiantes con menos del 80% de asistencia</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.estudiantes_con_baja_asistencia.map((estudiante, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded border-red-200"
                        >
                          <div>
                            <div className="font-medium">{estudiante.nombre_estudiante}</div>
                            <div className="text-sm text-muted-foreground">
                              CI: {estudiante.ci_estudiante} • {estudiante.curso}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-600 font-bold">{estudiante.porcentaje_asistencia.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">{estudiante.total_ausencias} ausencias</div>
                          </div>
                        </div>
                      ))}

                      {stats.estudiantes_con_baja_asistencia.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay estudiantes con baja asistencia
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No se pudieron cargar las estadísticas</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
