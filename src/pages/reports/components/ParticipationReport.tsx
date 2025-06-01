"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, FileText, Download, Star, TrendingUp } from "lucide-react"
import { participationApi, coursesApi, subjectsApi } from "@/lib/api"
import { exportToExcel, exportToCSV, exportToPDF, type ExportData } from "@/lib/export-utils"
import type { Participation, Course, Subject } from "@/types/api"

interface ParticipationFilters {
  curso?: string
  materia?: string
  tipo_participacion?: string
  fecha_inicio?: string
  fecha_fin?: string
}

export function ParticipationReport() {
  const [filters, setFilters] = useState<ParticipationFilters>({})
  const [participation, setParticipation] = useState<Participation[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total_participaciones: 0,
    promedio_calificacion: 0,
    por_tipo: [] as { tipo: string; cantidad: number; promedio: number }[],
    top_estudiantes: [] as { estudiante: string; participaciones: number; promedio: number }[],
    distribucion: [] as { rango: string; cantidad: number; porcentaje: number }[],
  })

  const tiposParticipacion = [
    "Participación en clase",
    "Exposición",
    "Debate",
    "Pregunta",
    "Respuesta",
    "Trabajo en grupo",
    "Presentación",
    "Discusión",
    "Investigación",
    "Proyecto",
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadParticipation()
    }
  }, [filters])

  const loadInitialData = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([coursesApi.getAll(), subjectsApi.getAll()])
      setCourses(coursesRes.results)
      setSubjects(subjectsRes.results)
    } catch (error) {
      console.error("Error loading initial data:", error)
    }
  }

  const loadParticipation = async () => {
    setLoading(true)
    try {
      const response = await participationApi.getAll(filters)
      setParticipation(response.results)
      calculateStats(response.results)
    } catch (error) {
      console.error("Error loading participation:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (participationData: Participation[]) => {
    if (participationData.length === 0) {
      setStats({
        total_participaciones: 0,
        promedio_calificacion: 0,
        por_tipo: [],
        top_estudiantes: [],
        distribucion: [],
      })
      return
    }

    const promedio = participationData.reduce((sum, p) => sum + p.calificacion, 0) / participationData.length

    // Estadísticas por tipo
    const tipoStats = new Map()
    participationData.forEach((p) => {
      if (!tipoStats.has(p.tipo_participacion)) {
        tipoStats.set(p.tipo_participacion, { cantidad: 0, suma: 0 })
      }
      const stats = tipoStats.get(p.tipo_participacion)
      stats.cantidad++
      stats.suma += p.calificacion
    })

    const por_tipo = Array.from(tipoStats.entries()).map(([tipo, stats]) => ({
      tipo,
      cantidad: stats.cantidad,
      promedio: stats.suma / stats.cantidad,
    }))

    // Top estudiantes
    const estudianteStats = new Map()
    participationData.forEach((p) => {
      if (!estudianteStats.has(p.ci_estudiante)) {
        estudianteStats.set(p.ci_estudiante, {
          nombre: p.estudiante_nombre,
          participaciones: 0,
          suma: 0,
        })
      }
      const stats = estudianteStats.get(p.ci_estudiante)
      stats.participaciones++
      stats.suma += p.calificacion
    })

    const top_estudiantes = Array.from(estudianteStats.values())
      .map((stats) => ({
        estudiante: stats.nombre,
        participaciones: stats.participaciones,
        promedio: stats.suma / stats.participaciones,
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 10)

    // Distribución de calificaciones
    const distribucion = [
      { rango: "5 (Excelente)", cantidad: participationData.filter((p) => p.calificacion === 5).length, porcentaje: 0 },
      { rango: "4 (Muy Bueno)", cantidad: participationData.filter((p) => p.calificacion === 4).length, porcentaje: 0 },
      { rango: "3 (Bueno)", cantidad: participationData.filter((p) => p.calificacion === 3).length, porcentaje: 0 },
      { rango: "2 (Regular)", cantidad: participationData.filter((p) => p.calificacion === 2).length, porcentaje: 0 },
      {
        rango: "1 (Deficiente)",
        cantidad: participationData.filter((p) => p.calificacion === 1).length,
        porcentaje: 0,
      },
      {
        rango: "0 (Sin participar)",
        cantidad: participationData.filter((p) => p.calificacion === 0).length,
        porcentaje: 0,
      },
    ]

    distribucion.forEach((d) => {
      d.porcentaje = (d.cantidad / participationData.length) * 100
    })

    setStats({
      total_participaciones: participationData.length,
      promedio_calificacion: promedio,
      por_tipo,
      top_estudiantes,
      distribucion,
    })
  }

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    const headers = ["Estudiante", "Curso", "Materia", "Tipo Participación", "Calificación", "Fecha", "Observaciones"]

    const data = participation.map((record) => [
      record.estudiante_nombre,
      record.curso_nombre,
      record.materia_nombre,
      record.tipo_participacion,
      record.calificacion.toString(),
      new Date(record.fecha).toLocaleDateString("es-ES"),
      record.observaciones || "",
    ])

    const exportData: ExportData = {
      headers,
      data,
      title: "Reporte de Participación",
      filename: `reporte_participacion_${new Date().toISOString().split("T")[0]}`,
    }

    switch (format) {
      case "excel":
        exportToExcel(exportData)
        break
      case "csv":
        exportToCSV(exportData)
        break
      case "pdf":
        exportToPDF(exportData)
        break
    }
  }

  const getParticipationColor = (calificacion: number) => {
    if (calificacion === 5) return "bg-green-500"
    if (calificacion === 4) return "bg-blue-500"
    if (calificacion === 3) return "bg-yellow-500"
    if (calificacion === 2) return "bg-orange-500"
    if (calificacion === 1) return "bg-red-500"
    return "bg-gray-500"
  }

  const getParticipationLabel = (calificacion: number) => {
    switch (calificacion) {
      case 5:
        return "Excelente"
      case 4:
        return "Muy Bueno"
      case 3:
        return "Bueno"
      case 2:
        return "Regular"
      case 1:
        return "Deficiente"
      case 0:
        return "Sin participar"
      default:
        return "N/A"
    }
  }

  const renderStars = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Participación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="curso">Curso</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, curso: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.codigo} value={course.codigo}>
                      {course.nombre} - {course.nivel} {course.paralelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="materia">Materia</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, materia: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las materias</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.codigo} value={subject.codigo}>
                      {subject.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo Participación</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, tipo_participacion: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposParticipacion.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_inicio: e.target.value }))} />
            </div>

            <div className="flex items-end">
              <Button onClick={loadParticipation} disabled={loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {participation.length > 0 && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total_participaciones}</div>
                    <p className="text-muted-foreground">Total Participaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.promedio_calificacion.toFixed(1)}</div>
                    <p className="text-muted-foreground">Promedio General</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.por_tipo.length}</div>
                <p className="text-muted-foreground">Tipos de Participación</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Estudiantes */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.top_estudiantes.map((estudiante, index) => (
                  <div key={estudiante.estudiante} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{estudiante.estudiante}</div>
                      <div className="text-sm text-muted-foreground">{estudiante.participaciones} participaciones</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(Math.round(estudiante.promedio))}</div>
                      <span className="font-bold">{estudiante.promedio.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribución de Calificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.distribucion.map((item) => (
                  <div key={item.rango} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{item.rango}</div>
                    <div className="flex-1">
                      <Progress value={item.porcentaje} className="h-2" />
                    </div>
                    <div className="w-24 text-sm text-muted-foreground">
                      {item.cantidad} ({item.porcentaje.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botones de Exportación */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => handleExport("excel")} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button onClick={() => handleExport("csv")} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={() => handleExport("pdf")} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Participación */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Participación</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participation.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.estudiante_nombre}</TableCell>
                      <TableCell>{record.curso_nombre}</TableCell>
                      <TableCell>{record.materia_nombre}</TableCell>
                      <TableCell>{record.tipo_participacion}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(record.calificacion)}</div>
                          <Badge className={getParticipationColor(record.calificacion)}>
                            {getParticipationLabel(record.calificacion)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(record.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>{record.observaciones}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
