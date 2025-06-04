"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/common/DataTable"
import { studentsApi, coursesApi } from "@/lib/api"
import { GraduationCap, TrendingUp, Users, Award } from "lucide-react"
import type { Student, Course } from "@/types/api"

interface RendimientoData {
  ci: string
  nombre_completo: string
  curso: string
  promedio_general: number
  porcentaje_asistencia: number
  total_notas: number
  estado_academico: "Excelente" | "Bueno" | "Regular" | "Deficiente"
}

export function RendimientoPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [rendimientoData, setRendimientoData] = useState<RendimientoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    processRendimientoData()
  }, [students, selectedCourse, searchTerm])

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([studentsApi.getAll(), coursesApi.getAll()])

      setStudents(studentsRes.results)
      setCourses(coursesRes.results)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const processRendimientoData = () => {
    let filteredStudents = students

    // Filtrar por curso si está seleccionado
    if (selectedCourse) {
      filteredStudents = students.filter((student) => student.curso_actual?.codigo === selectedCourse)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.ci.includes(searchTerm),
      )
    }

    const processedData: RendimientoData[] = filteredStudents.map((student) => {
      // Simular datos de rendimiento (en producción vendrían del API)
      const promedio_general = student.rendimiento_resumen?.promedio_general || Math.random() * 40 + 60
      const porcentaje_asistencia = student.rendimiento_resumen?.porcentaje_asistencia || Math.random() * 20 + 80
      const total_notas = student.rendimiento_resumen?.total_notas || Math.floor(Math.random() * 10) + 5

      let estado_academico: "Excelente" | "Bueno" | "Regular" | "Deficiente"
      if (promedio_general >= 90) estado_academico = "Excelente"
      else if (promedio_general >= 75) estado_academico = "Bueno"
      else if (promedio_general >= 60) estado_academico = "Regular"
      else estado_academico = "Deficiente"

      return {
        ci: student.ci,
        nombre_completo: `${student.nombre} ${student.apellido}`,
        curso: student.curso_actual?.nombre || "Sin curso",
        promedio_general: Math.round(promedio_general * 10) / 10,
        porcentaje_asistencia: Math.round(porcentaje_asistencia * 10) / 10,
        total_notas,
        estado_academico,
      }
    })

    setRendimientoData(processedData)
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Excelente":
        return "default"
      case "Bueno":
        return "secondary"
      case "Regular":
        return "outline"
      case "Deficiente":
        return "destructive"
      default:
        return "outline"
    }
  }

  const calculateStats = () => {
    if (rendimientoData.length === 0) {
      return {
        totalEstudiantes: 0,
        promedioGeneral: 0,
        asistenciaPromedio: 0,
        estudiantesExcelentes: 0,
      }
    }

    const totalEstudiantes = rendimientoData.length
    const promedioGeneral =
      rendimientoData.reduce((sum, student) => sum + student.promedio_general, 0) / totalEstudiantes
    const asistenciaPromedio =
      rendimientoData.reduce((sum, student) => sum + student.porcentaje_asistencia, 0) / totalEstudiantes
    const estudiantesExcelentes = rendimientoData.filter((student) => student.estado_academico === "Excelente").length

    return {
      totalEstudiantes,
      promedioGeneral: Math.round(promedioGeneral * 10) / 10,
      asistenciaPromedio: Math.round(asistenciaPromedio * 10) / 10,
      estudiantesExcelentes,
    }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "nombre_completo",
      label: "Estudiante",
      sortable: true,
    },
    {
      key: "curso",
      label: "Curso",
      sortable: true,
    },
    {
      key: "promedio_general",
      label: "Promedio",
      render: (value: number) => (
        <div className="font-medium">
          {value.toFixed(1)}
          <span className="text-xs text-muted-foreground ml-1">/100</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "porcentaje_asistencia",
      label: "Asistencia",
      render: (value: number) => <div className="font-medium">{value.toFixed(1)}%</div>,
      sortable: true,
    },
    {
      key: "total_notas",
      label: "Total Notas",
      sortable: true,
    },
    {
      key: "estado_academico",
      label: "Estado",
      render: (value: string) => <Badge variant={getEstadoBadgeVariant(value)}>{value}</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rendimiento Académico</h2>
          <p className="text-muted-foreground">Visualiza el rendimiento académico de todos los estudiantes</p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEstudiantes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promedioGeneral}</div>
            <p className="text-xs text-muted-foreground">sobre 100 puntos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.asistenciaPromedio}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Excelentes</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estudiantesExcelentes}</div>
            <p className="text-xs text-muted-foreground">promedio ≥ 90</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los datos por curso o busca estudiantes específicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Estudiante</label>
              <Input
                placeholder="Nombre, apellido o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrar por Curso</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
          </div>
          {(selectedCourse || searchTerm) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCourse("")
                setSearchTerm("")
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Rendimiento */}
      <DataTable
        data={rendimientoData}
        columns={columns}
        searchPlaceholder="Buscar en la tabla..."
        isLoading={isLoading}
        showEdit={false}
        showDelete={false}
        showView={false}
      />
    </div>
  )
}
