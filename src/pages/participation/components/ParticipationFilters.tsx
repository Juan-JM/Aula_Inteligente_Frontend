"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import { coursesApi, subjectsApi } from "@/lib/api"
import type { Course, Subject } from "@/types/api"

interface ParticipationFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function ParticipationFilters({ onFiltersChange }: ParticipationFiltersProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filters, setFilters] = useState({
    codigo_curso: "",
    codigo_materia: "",
    ci_estudiante: "",
    fecha: "",
    tipo_participacion: "",
  })

  useEffect(() => {
    fetchCourses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll()
      setSubjects(response.results)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      codigo_curso: "",
      codigo_materia: "",
      ci_estudiante: "",
      fecha: "",
      tipo_participacion: "",
    })
  }

  const participationTypes = [
    "Participación en clase",
    "Pregunta respondida",
    "Exposición",
    "Debate",
    "Trabajo en equipo",
    "Presentación",
    "Intervención voluntaria",
    "Liderazgo",
    "Colaboración",
    "Iniciativa",
  ]

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Curso</Label>
            <Select value={filters.codigo_curso} onValueChange={(value) => handleFilterChange("codigo_curso", value)}>
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

          <div className="space-y-2">
            <Label>Materia</Label>
            <Select
              value={filters.codigo_materia}
              onValueChange={(value) => handleFilterChange("codigo_materia", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las materias" />
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

          <div className="space-y-2">
            <Label>Tipo de Participación</Label>
            <Select
              value={filters.tipo_participacion}
              onValueChange={(value) => handleFilterChange("tipo_participacion", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {participationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cédula del Estudiante</Label>
            <Input
              placeholder="Buscar por CI..."
              value={filters.ci_estudiante}
              onChange={(e) => handleFilterChange("ci_estudiante", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={filters.fecha} onChange={(e) => handleFilterChange("fecha", e.target.value)} />
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
