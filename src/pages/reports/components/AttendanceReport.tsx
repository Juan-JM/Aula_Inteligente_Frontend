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
import { FileSpreadsheet, FileText, Download, Calendar, Users, Clock } from "lucide-react"
import { attendanceApi, coursesApi } from "@/lib/api"
import { exportToExcel, exportToCSV, exportToPDF, type ExportData } from "@/lib/export-utils"
import type { Attendance, Course } from "@/types/api"

interface AttendanceFilters {
  curso?: string
  fecha_inicio?: string
  fecha_fin?: string
  estado?: string
}

export function AttendanceReport() {
  const [filters, setFilters] = useState<AttendanceFilters>({})
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total_registros: 0,
    porcentaje_asistencia: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    justificados: 0,
    por_curso: [] as { curso: string; asistencia: number; total: number; porcentaje: number }[],
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      loadAttendance()
    }
  }, [filters])

  const loadInitialData = async () => {
    try {
      const coursesRes = await coursesApi.getAll()
      setCourses(coursesRes.results)
    } catch (error) {
      console.error("Error loading initial data:", error)
    }
  }

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const response = await attendanceApi.getAll(filters)
      setAttendance(response.results)
      calculateStats(response.results)
    } catch (error) {
      console.error("Error loading attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (attendanceData: Attendance[]) => {
    if (attendanceData.length === 0) {
      setStats({
        total_registros: 0,
        porcentaje_asistencia: 0,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
        por_curso: [],
      })
      return
    }

    const presentes = attendanceData.filter((a) => a.estado === "presente").length
    const ausentes = attendanceData.filter((a) => a.estado === "ausente").length
    const tardanzas = attendanceData.filter((a) => a.estado === "tardanza").length
    const justificados = attendanceData.filter((a) => a.estado === "justificado").length

    const porcentaje_asistencia = ((presentes + tardanzas + justificados) / attendanceData.length) * 100

    // Estadísticas por curso
    const cursoStats = new Map()
    attendanceData.forEach((record) => {
      if (!cursoStats.has(record.codigo_curso)) {
        cursoStats.set(record.codigo_curso, {
          curso: record.curso_nombre,
          presentes: 0,
          total: 0,
        })
      }
      const stats = cursoStats.get(record.codigo_curso)
      stats.total++
      if (["presente", "tardanza", "justificado"].includes(record.estado)) {
        stats.presentes++
      }
    })

    const por_curso = Array.from(cursoStats.values()).map((stat) => ({
      curso: stat.curso,
      asistencia: stat.presentes,
      total: stat.total,
      porcentaje: (stat.presentes / stat.total) * 100,
    }))

    setStats({
      total_registros: attendanceData.length,
      porcentaje_asistencia,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      por_curso,
    })
  }

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    const headers = ["Estudiante", "Curso", "Fecha", "Estado", "Hora Llegada", "Observaciones"]

    const data = attendance.map((record) => [
      record.estudiante_nombre,
      record.curso_nombre,
      new Date(record.fecha).toLocaleDateString("es-ES"),
      record.estado,
      record.hora_llegada || "",
      record.observaciones || "",
    ])

    const exportData: ExportData = {
      headers,
      data,
      title: "Reporte de Asistencia",
      filename: `reporte_asistencia_${new Date().toISOString().split("T")[0]}`,
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

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "presente":
        return "bg-green-500"
      case "ausente":
        return "bg-red-500"
      case "tardanza":
        return "bg-yellow-500"
      case "justificado":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case "presente":
        return "Presente"
      case "ausente":
        return "Ausente"
      case "tardanza":
        return "Tardanza"
      case "justificado":
        return "Justificado"
      default:
        return estado
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Asistencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_inicio: e.target.value }))} />
            </div>

            <div>
              <Label htmlFor="fecha_fin">Fecha Fin</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_fin: e.target.value }))} />
            </div>

            <div className="flex items-end">
              <Button onClick={loadAttendance} disabled={loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {attendance.length > 0 && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total_registros}</div>
                    <p className="text-muted-foreground">Total Registros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.porcentaje_asistencia.toFixed(1)}%</div>
                    <p className="text-muted-foreground">% Asistencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{stats.presentes}</div>
                <p className="text-muted-foreground">Presentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">{stats.ausentes}</div>
                <p className="text-muted-foreground">Ausentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.tardanzas}</div>
                <p className="text-muted-foreground">Tardanzas</p>
              </CardContent>
            </Card>
          </div>

          {/* Asistencia por Curso */}
          <Card>
            <CardHeader>
              <CardTitle>Asistencia por Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.por_curso.map((item) => (
                  <div key={item.curso} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{item.curso}</div>
                    <div className="flex-1">
                      <Progress value={item.porcentaje} className="h-2" />
                    </div>
                    <div className="w-24 text-sm text-muted-foreground">
                      {item.asistencia}/{item.total} ({item.porcentaje.toFixed(1)}%)
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

          {/* Tabla de Asistencia */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Hora Llegada</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.estudiante_nombre}</TableCell>
                      <TableCell>{record.curso_nombre}</TableCell>
                      <TableCell>{new Date(record.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.estado)}>{getStatusLabel(record.estado)}</Badge>
                      </TableCell>
                      <TableCell>
                        {record.hora_llegada && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.hora_llegada}
                          </div>
                        )}
                      </TableCell>
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
