"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { coursesApi, subjectsApi } from "@/lib/api"
import type { Course, Subject } from "@/types/api"

interface GradeFiltersProps {
  onFiltersChange: (filters: {
    codigo_curso: string
    codigo_materia: string
    ci_estudiante: string
    codigo_criterio: string
  }) => void
}

export function GradeFilters({ onFiltersChange }: GradeFiltersProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [criteria, setCriteria] = useState<any[]>([])
  const [filters, setFilters] = useState({
    codigo_curso: "",
    codigo_materia: "",
    ci_estudiante: "",
    codigo_criterio: "",
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchFilterData()
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const fetchFilterData = async () => {
    try {
      const [coursesResponse, subjectsResponse, criteriaResponse] = await Promise.all([
        coursesApi.getAll(),
        subjectsApi.getAll(),
        coursesApi.getCriteria(),
      ])
      setCourses(coursesResponse.results)
      setSubjects(subjectsResponse.results)
      setCriteria(criteriaResponse.results)
    } catch (error) {
      console.error("Error fetching filter data:", error)
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
      codigo_criterio: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                      {course.nombre}
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
              <Label>CI Estudiante</Label>
              <Input
                placeholder="Buscar por CI"
                value={filters.ci_estudiante}
                onChange={(e) => handleFilterChange("ci_estudiante", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Criterio</Label>
              <Select
                value={filters.codigo_criterio}
                onValueChange={(value) => handleFilterChange("codigo_criterio", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los criterios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los criterios</SelectItem>
                  {criteria.map((criterio) => (
                    <SelectItem key={criterio.codigo} value={criterio.codigo}>
                      {criterio.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
