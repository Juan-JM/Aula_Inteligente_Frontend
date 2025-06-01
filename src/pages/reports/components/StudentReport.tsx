"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, FileText, Download, User, GraduationCap, Calendar, Star } from "lucide-react"
import { studentsApi, gradesApi, attendanceApi, participationApi } from "@/lib/api"
import { exportToExcel, exportToCSV, exportToPDF, type ExportData } from "@/lib/export-utils"
import type { Student, Grade, Attendance, Participation } from "@/types/api"

interface StudentData {
  student: Student
  grades: Grade[]
  attendance: Attendance[]
  participation: Participation[]
  stats: {
    promedio_general: number
    porcentaje_asistencia: number
    total_participaciones: number
    promedio_participacion: number
  }
}

export function StudentReport() {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [periodo, setPeriodo] = useState<string>("")

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const response = await studentsApi.getAll()
      setStudents(response.results)
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const loadStudentData = async () => {
    if (!selectedStudent) return

    setLoading(true)
    try {
      const [student, gradesRes, attendanceRes, participationRes] = await Promise.all([
        studentsApi.getById(selectedStudent),
        gradesApi.getAll({ ci_estudiante: selectedStudent, periodo }),
        attendanceApi.getAll({ ci_estudiante: selectedStudent, periodo }),
        participationApi.getAll({ ci_estudiante: selectedStudent, periodo }),
      ])

      const grades = gradesRes.results
      const attendance = attendanceRes.results
      const participation = participationRes.results

      // Calcular estadísticas
      const promedio_general = grades.length > 0 ? grades.reduce((sum, g) => sum + g.nota, 0) / grades.length : 0

      const asistencias_efectivas = attendance.filter((a) =>
        ["presente", "tardanza", "justificado"].includes(a.estado),
      ).length
      const porcentaje_asistencia = attendance.length > 0 ? (asistencias_efectivas / attendance.length) * 100 : 0

      const promedio_participacion =
        participation.length > 0 ? participation.reduce((sum, p) => sum + p.calificacion, 0) / participation.length : 0

      setStudentData({
        student,
        grades,
        attendance,
        participation,
        stats: {
          promedio_general,
          porcentaje_asistencia,
          total_participaciones: participation.length,
          promedio_participacion,
        },
      })
    } catch (error) {
      console.error("Error loading student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    if (!studentData) return

    const headers = ["Tipo", "Materia/Curso", "Descripción", "Valor/Estado", "Fecha", "Observaciones"]

    const data = [
      // Calificaciones
      ...studentData.grades.map((grade) => [
        "Calificación",
        grade.materia_nombre,
        grade.criterio_descripcion,
        grade.nota.toString(),
        new Date(grade.created_at).toLocaleDateString("es-ES"),
        grade.observaciones || "",
      ]),
      // Asistencia
      ...studentData.attendance.map((att) => [
        "Asistencia",
        att.curso_nombre,
        "Registro de asistencia",
        att.estado,
        new Date(att.fecha).toLocaleDateString("es-ES"),
        att.observaciones || "",
      ]),
      // Participación
      ...studentData.participation.map((part) => [
        "Participación",
        part.materia_nombre,
        part.tipo_participacion,
        part.calificacion.toString(),
        new Date(part.fecha).toLocaleDateString("es-ES"),
        part.observaciones || "",
      ]),
    ]

    const exportData: ExportData = {
      headers,
      data,
      title: `Reporte Individual - ${studentData.student.nombre} ${studentData.student.apellido}`,
      filename: `reporte_estudiante_${studentData.student.ci}_${new Date().toISOString().split("T")[0]}`,
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

  const renderStars = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reporte Individual por Estudiante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="estudiante">Estudiante</Label>
              <Select onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.ci} value={student.ci}>
                      {student.nombre} {student.apellido} - {student.ci}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodo">Período (Opcional)</Label>
              <Input placeholder="Ej: 2024-1" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button onClick={loadStudentData} disabled={!selectedStudent || loading} className="w-full">
                {loading ? "Cargando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {studentData && (
        <>
          {/* Información del Estudiante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <strong>Nombre:</strong> {studentData.student.nombre} {studentData.student.apellido}
                  </div>
                  <div>
                    <strong>CI:</strong> {studentData.student.ci}
                  </div>
                  <div>
                    <strong>Email:</strong> {studentData.student.email}
                  </div>
                  <div>
                    <strong>Fecha de Nacimiento:</strong>{" "}
                    {new Date(studentData.student.fecha_nacimiento).toLocaleDateString("es-ES")}
                  </div>
                </div>
                <div className="space-y-2">
                  {studentData.student.curso_actual && (
                    <>
                      <div>
                        <strong>Curso:</strong> {studentData.student.curso_actual.nombre}
                      </div>
                      <div>
                        <strong>Nivel:</strong> {studentData.student.curso_actual.nivel}{" "}
                        {studentData.student.curso_actual.paralelo}
                      </div>
                      <div>
                        <strong>Gestión:</strong> {studentData.student.curso_actual.gestion}
                      </div>
                    </>
                  )}
                  <div>
                    <strong>Estado:</strong>
                    <Badge variant={studentData.student.is_active ? "default" : "destructive"} className="ml-2">
                      {studentData.student.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{studentData.stats.promedio_general.toFixed(1)}</div>
                    <p className="text-muted-foreground">Promedio General</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{studentData.stats.porcentaje_asistencia.toFixed(1)}%</div>
                    <p className="text-muted-foreground">Asistencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{studentData.stats.total_participaciones}</div>
                    <p className="text-muted-foreground">Participaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{studentData.stats.promedio_participacion.toFixed(1)}</div>
                <p className="text-muted-foreground">Promedio Participación</p>
              </CardContent>
            </Card>
          </div>

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

          {/* Detalles por Categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle Académico</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grades" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grades">Calificaciones</TabsTrigger>
                  <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                  <TabsTrigger value="participation">Participación</TabsTrigger>
                </TabsList>

                <TabsContent value="grades" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Materia</TableHead>
                        <TableHead>Criterio</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell className="font-medium">{grade.materia_nombre}</TableCell>
                          <TableCell>{grade.criterio_descripcion}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{grade.nota}</span>
                              <Badge variant={grade.nota >= 51 ? "default" : "destructive"}>
                                {grade.nota >= 51 ? "Aprobado" : "Reprobado"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{grade.periodo_nombre}</TableCell>
                          <TableCell>{new Date(grade.created_at).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>{grade.observaciones}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Hora Llegada</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.attendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.curso_nombre}</TableCell>
                          <TableCell>{new Date(record.fecha).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.estado === "presente"
                                  ? "default"
                                  : record.estado === "ausente"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {record.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.hora_llegada}</TableCell>
                          <TableCell>{record.observaciones}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="participation" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Materia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Calificación</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.participation.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.materia_nombre}</TableCell>
                          <TableCell>{record.tipo_participacion}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex">{renderStars(record.calificacion)}</div>
                              <span className="font-bold">{record.calificacion}</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(record.fecha).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>{record.observaciones}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
