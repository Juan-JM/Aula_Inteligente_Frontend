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
import { FileSpreadsheet, FileText, Download } from "lucide-react"
import { gradesApi, coursesApi, subjectsApi } from "@/lib/api"
import { exportToExcel, exportToCSV, exportToPDF, type ExportData } from "@/lib/export-utils"
import type { Grade, Course, Subject } from "@/types/api"

interface AcademicFilters {
  curso?: string
  materia?: string
  periodo?: string
  fecha_inicio?: string
  fecha_fin?: string
}

export function AcademicReport() {
  const [filters, setFilters] = useState<AcademicFilters>({})
  const [grades, setGrades] = useState<Grade[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    promedio_general: 0,
    total_estudiantes: 0,
    aprobados: 0,
    reprobados: 0,
    distribucion: [] as { rango: string; cantidad: number; porcentaje: number }[],
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadGrades()
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

  const loadGrades = async () => {
    setLoading(true)
    try {
      const response = await gradesApi.getAll(filters)
      setGrades(response.results)
      calculateStats(response.results)
    } catch (error) {
      console.error("Error loading grades:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (gradesData: Grade[]) => {
    if (gradesData.length === 0) {
      setStats({
        promedio_general: 0,
        total_estudiantes: 0,
        aprobados: 0,
        reprobados: 0,
        distribucion: [],
      })
      return
    }

    const promedio = gradesData.reduce((sum, grade) => sum + grade.nota, 0) / gradesData.length
    const estudiantes = new Set(gradesData.map((g) => g.ci_estudiante)).size
    const aprobados = gradesData.filter((g) => g.nota >= 51).length
    const reprobados = gradesData.filter((g) => g.nota < 51).length

    const distribucion = [
      { rango: "90-100", cantidad: gradesData.filter((g) => g.nota >= 90).length, porcentaje: 0 },
      { rango: "80-89", cantidad: gradesData.filter((g) => g.nota >= 80 && g.nota < 90).length, porcentaje: 0 },
      { rango: "70-79", cantidad: gradesData.filter((g) => g.nota >= 70 && g.nota < 80).length, porcentaje: 0 },
      { rango: "60-69", cantidad: gradesData.filter((g) => g.nota >= 60 && g.nota < 70).length, porcentaje: 0 },
      { rango: "51-59", cantidad: gradesData.filter((g) => g.nota >= 51 && g.nota < 60).length, porcentaje: 0 },
      { rango: "0-50", cantidad: gradesData.filter((g) => g.nota < 51).length, porcentaje: 0 },
    ]

    distribucion.forEach((d) => {
      d.porcentaje = (d.cantidad / gradesData.length) * 100
    })

    setStats({
      promedio_general: promedio,
      total_estudiantes: estudiantes,
      aprobados,
      reprobados,
      distribucion,
    })
  }

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    const headers = ["Estudiante", "Curso", "Materia", "Criterio", "Nota", "Periodo", "Fecha", "Observaciones"]

    const data = grades.map((grade) => [
      grade.estudiante_nombre,
      grade.curso_nombre,
      grade.materia_nombre,
      grade.criterio_descripcion,
      grade.nota.toString(),
      grade.periodo_nombre,
      new Date(grade.created_at).toLocaleDateString("es-ES"),
      grade.observaciones || "",
    ])

    const exportData: ExportData = {
      headers,
      data,
      title: "Reporte Académico",
      filename: `reporte_academico_${new Date().toISOString().split("T")[0]}`,
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

  const getGradeColor = (nota: number) => {
    if (nota >= 90) return "bg-green-500"
    if (nota >= 80) return "bg-blue-500"
    if (nota >= 70) return "bg-yellow-500"
    if (nota >= 51) return "bg-orange-500"
    return "bg-red-500"
  }

  const getGradeLabel = (nota: number) => {
    if (nota >= 90) return "Excelente"
    if (nota >= 80) return "Muy Bueno"
    if (nota >= 70) return "Bueno"
    if (nota >= 51) return "Aprobado"
    return "Reprobado"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte Académico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_inicio: e.target.value }))} />
            </div>

            <div>
              <Label htmlFor="fecha_fin">Fecha Fin</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_fin: e.target.value }))} />
            </div>

            <div className="flex items-end">
              <Button onClick={loadGrades} disabled={loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {grades.length > 0 && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.promedio_general.toFixed(1)}</div>
                <p className="text-muted-foreground">Promedio General</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.total_estudiantes}</div>
                <p className="text-muted-foreground">Total Estudiantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{stats.aprobados}</div>
                <p className="text-muted-foreground">Aprobados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">{stats.reprobados}</div>
                <p className="text-muted-foreground">Reprobados</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de Calificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.distribucion.map((item) => (
                  <div key={item.rango} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">{item.rango}</div>
                    <div className="flex-1">
                      <Progress value={item.porcentaje} className="h-2" />
                    </div>
                    <div className="w-20 text-sm text-muted-foreground">
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

          {/* Tabla de Calificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Criterio</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.estudiante_nombre}</TableCell>
                      <TableCell>{grade.curso_nombre}</TableCell>
                      <TableCell>{grade.materia_nombre}</TableCell>
                      <TableCell>{grade.criterio_descripcion}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{grade.nota}</span>
                          <div className={`w-2 h-2 rounded-full ${getGradeColor(grade.nota)}`} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.nota >= 51 ? "default" : "destructive"}>
                          {getGradeLabel(grade.nota)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(grade.created_at).toLocaleDateString("es-ES")}</TableCell>
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
