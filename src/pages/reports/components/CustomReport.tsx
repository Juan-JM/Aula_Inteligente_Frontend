"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, FileText, Download, Filter, Settings } from "lucide-react"
import { gradesApi, attendanceApi, participationApi, coursesApi, subjectsApi } from "@/lib/api"
import { exportToExcel, exportToCSV, exportToPDF, type ExportData } from "@/lib/export-utils"
import type { Course, Subject } from "@/types/api"

interface CustomFilters {
  tipo_reporte: "calificaciones" | "asistencia" | "participacion" | "combinado"
  curso?: string
  materia?: string
  fecha_inicio?: string
  fecha_fin?: string
  estado_asistencia?: string
  rango_notas?: { min: number; max: number }
  incluir_observaciones: boolean
  agrupar_por?: "estudiante" | "curso" | "materia" | "fecha"
  campos_adicionales: string[]
}

export function CustomReport() {
  const [filters, setFilters] = useState<CustomFilters>({
    tipo_reporte: "calificaciones",
    incluir_observaciones: true,
    campos_adicionales: [],
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const camposDisponibles = [
    { id: "fecha_nacimiento", label: "Fecha de Nacimiento" },
    { id: "email", label: "Email" },
    { id: "telefono", label: "Teléfono" },
    { id: "direccion", label: "Dirección" },
    { id: "tutor", label: "Tutor" },
    { id: "promedio_general", label: "Promedio General" },
    { id: "total_faltas", label: "Total Faltas" },
    { id: "porcentaje_asistencia", label: "% Asistencia" },
  ]

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([coursesApi.getAll(), subjectsApi.getAll()])
      setCourses(coursesRes.results)
      setSubjects(subjectsRes.results)
    } catch (error) {
      console.error("Error loading initial data:", error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      let data: any[] = []

      switch (filters.tipo_reporte) {
        case "calificaciones":
          const gradesRes = await gradesApi.getAll({
            curso: filters.curso,
            materia: filters.materia,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin,
          })
          data = gradesRes.results
          break

        case "asistencia":
          const attendanceRes = await attendanceApi.getAll({
            curso: filters.curso,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin,
            estado: filters.estado_asistencia,
          })
          data = attendanceRes.results
          break

        case "participacion":
          const participationRes = await participationApi.getAll({
            curso: filters.curso,
            materia: filters.materia,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin,
          })
          data = participationRes.results
          break

        case "combinado":
          // Lógica para reporte combinado
          const [grades, attendance, participation] = await Promise.all([
            gradesApi.getAll({ curso: filters.curso, materia: filters.materia }),
            attendanceApi.getAll({ curso: filters.curso }),
            participationApi.getAll({ curso: filters.curso, materia: filters.materia }),
          ])

          // Combinar datos por estudiante
          const combinedData = new Map()

          grades.results.forEach((grade) => {
            if (!combinedData.has(grade.ci_estudiante)) {
              combinedData.set(grade.ci_estudiante, {
                estudiante: grade.estudiante_nombre,
                ci: grade.ci_estudiante,
                calificaciones: [],
                asistencias: [],
                participaciones: [],
              })
            }
            combinedData.get(grade.ci_estudiante).calificaciones.push(grade)
          })

          attendance.results.forEach((att) => {
            if (combinedData.has(att.ci_estudiante)) {
              combinedData.get(att.ci_estudiante).asistencias.push(att)
            }
          })

          participation.results.forEach((part) => {
            if (combinedData.has(part.ci_estudiante)) {
              combinedData.get(part.ci_estudiante).participaciones.push(part)
            }
          })

          data = Array.from(combinedData.values())
          break
      }

      setReportData(data)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    if (reportData.length === 0) return

    let headers: string[] = []
    let data: any[][] = []

    switch (filters.tipo_reporte) {
      case "calificaciones":
        headers = ["Estudiante", "CI", "Curso", "Materia", "Criterio", "Nota", "Fecha"]
        if (filters.incluir_observaciones) headers.push("Observaciones")

        data = reportData.map((item) => {
          const row = [
            item.estudiante_nombre,
            item.ci_estudiante,
            item.curso_nombre,
            item.materia_nombre,
            item.criterio_descripcion,
            item.nota.toString(),
            new Date(item.created_at).toLocaleDateString("es-ES"),
          ]
          if (filters.incluir_observaciones) row.push(item.observaciones || "")
          return row
        })
        break

      case "asistencia":
        headers = ["Estudiante", "CI", "Curso", "Fecha", "Estado", "Hora Llegada"]
        if (filters.incluir_observaciones) headers.push("Observaciones")

        data = reportData.map((item) => {
          const row = [
            item.estudiante_nombre,
            item.ci_estudiante,
            item.curso_nombre,
            new Date(item.fecha).toLocaleDateString("es-ES"),
            item.estado,
            item.hora_llegada || "",
          ]
          if (filters.incluir_observaciones) row.push(item.observaciones || "")
          return row
        })
        break

      case "participacion":
        headers = ["Estudiante", "CI", "Curso", "Materia", "Tipo", "Calificación", "Fecha"]
        if (filters.incluir_observaciones) headers.push("Observaciones")

        data = reportData.map((item) => {
          const row = [
            item.estudiante_nombre,
            item.ci_estudiante,
            item.curso_nombre,
            item.materia_nombre,
            item.tipo_participacion,
            item.calificacion.toString(),
            new Date(item.fecha).toLocaleDateString("es-ES"),
          ]
          if (filters.incluir_observaciones) row.push(item.observaciones || "")
          return row
        })
        break

      case "combinado":
        headers = [
          "Estudiante",
          "CI",
          "Promedio Calificaciones",
          "Total Asistencias",
          "% Asistencia",
          "Total Participaciones",
          "Promedio Participación",
        ]

        data = reportData.map((item) => {
          const promedioCalif =
            item.calificaciones.length > 0
              ? item.calificaciones.reduce((sum: number, g: any) => sum + g.nota, 0) / item.calificaciones.length
              : 0

          const asistenciasEfectivas = item.asistencias.filter((a: any) =>
            ["presente", "tardanza", "justificado"].includes(a.estado),
          ).length

          const porcentajeAsistencia =
            item.asistencias.length > 0 ? (asistenciasEfectivas / item.asistencias.length) * 100 : 0

          const promedioParticipacion =
            item.participaciones.length > 0
              ? item.participaciones.reduce((sum: number, p: any) => sum + p.calificacion, 0) /
                item.participaciones.length
              : 0

          return [
            item.estudiante,
            item.ci,
            promedioCalif.toFixed(1),
            item.asistencias.length.toString(),
            porcentajeAsistencia.toFixed(1) + "%",
            item.participaciones.length.toString(),
            promedioParticipacion.toFixed(1),
          ]
        })
        break
    }

    const exportData: ExportData = {
      headers,
      data,
      title: `Reporte Personalizado - ${filters.tipo_reporte}`,
      filename: `reporte_personalizado_${filters.tipo_reporte}_${new Date().toISOString().split("T")[0]}`,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Reporte Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Reporte */}
          <div>
            <Label>Tipo de Reporte</Label>
            <Select
              value={filters.tipo_reporte}
              onValueChange={(value: any) => setFilters((prev) => ({ ...prev, tipo_reporte: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calificaciones">Calificaciones</SelectItem>
                <SelectItem value="asistencia">Asistencia</SelectItem>
                <SelectItem value="participacion">Participación</SelectItem>
                <SelectItem value="combinado">Reporte Combinado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Curso</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, curso: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los cursos" />
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

            {(filters.tipo_reporte === "calificaciones" ||
              filters.tipo_reporte === "participacion" ||
              filters.tipo_reporte === "combinado") && (
              <div>
                <Label>Materia</Label>
                <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, materia: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las materias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las materias</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.codigo} value={subject.codigo}>
                        {subject.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Fecha Inicio</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_inicio: e.target.value }))} />
            </div>

            <div>
              <Label>Fecha Fin</Label>
              <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, fecha_fin: e.target.value }))} />
            </div>
          </div>

          {/* Filtros Específicos */}
          {filters.tipo_reporte === "asistencia" && (
            <div>
              <Label>Estado de Asistencia</Label>
              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, estado_asistencia: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="tardanza">Tardanza</SelectItem>
                  <SelectItem value="justificado">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {filters.tipo_reporte === "calificaciones" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nota Mínima</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      rango_notas: {
                        ...prev.rango_notas,
                        min: Number.parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Nota Máxima</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      rango_notas: {
                        ...prev.rango_notas,
                        max: Number.parseInt(e.target.value) || 100,
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* Opciones Adicionales */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="observaciones"
                checked={filters.incluir_observaciones}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, incluir_observaciones: checked as boolean }))
                }
              />
              <Label htmlFor="observaciones">Incluir observaciones</Label>
            </div>

            <div>
              <Label>Agrupar por</Label>
              <Select onValueChange={(value: any) => setFilters((prev) => ({ ...prev, agrupar_por: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin agrupación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin agrupación</SelectItem>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="curso">Curso</SelectItem>
                  <SelectItem value="materia">Materia</SelectItem>
                  <SelectItem value="fecha">Fecha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Campos Adicionales</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {camposDisponibles.map((campo) => (
                  <div key={campo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={campo.id}
                      checked={filters.campos_adicionales.includes(campo.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            campos_adicionales: [...prev.campos_adicionales, campo.id],
                          }))
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            campos_adicionales: prev.campos_adicionales.filter((c) => c !== campo.id),
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={campo.id} className="text-sm">
                      {campo.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={loading} className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              {loading ? "Generando..." : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <>
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

          {/* Vista Previa de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del Reporte ({reportData.length} registros)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {filters.tipo_reporte === "combinado" ? (
                        <>
                          <TableHead>Estudiante</TableHead>
                          <TableHead>CI</TableHead>
                          <TableHead>Calificaciones</TableHead>
                          <TableHead>Asistencias</TableHead>
                          <TableHead>Participaciones</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Estudiante</TableHead>
                          <TableHead>Curso</TableHead>
                          {filters.tipo_reporte === "calificaciones" && <TableHead>Nota</TableHead>}
                          {filters.tipo_reporte === "asistencia" && <TableHead>Estado</TableHead>}
                          {filters.tipo_reporte === "participacion" && <TableHead>Calificación</TableHead>}
                          <TableHead>Fecha</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.slice(0, 50).map((item, index) => (
                      <TableRow key={index}>
                        {filters.tipo_reporte === "combinado" ? (
                          <>
                            <TableCell>{item.estudiante}</TableCell>
                            <TableCell>{item.ci}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.calificaciones.length} calificaciones</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.asistencias.length} registros</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.participaciones.length} participaciones</Badge>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{item.estudiante_nombre}</TableCell>
                            <TableCell>{item.curso_nombre}</TableCell>
                            {filters.tipo_reporte === "calificaciones" && (
                              <TableCell>
                                <Badge variant={item.nota >= 51 ? "default" : "destructive"}>{item.nota}</Badge>
                              </TableCell>
                            )}
                            {filters.tipo_reporte === "asistencia" && (
                              <TableCell>
                                <Badge variant={item.estado === "presente" ? "default" : "secondary"}>
                                  {item.estado}
                                </Badge>
                              </TableCell>
                            )}
                            {filters.tipo_reporte === "participacion" && (
                              <TableCell>
                                <Badge>{item.calificacion}/5</Badge>
                              </TableCell>
                            )}
                            <TableCell>{new Date(item.fecha || item.created_at).toLocaleDateString("es-ES")}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {reportData.length > 50 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Mostrando los primeros 50 registros de {reportData.length} total
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
