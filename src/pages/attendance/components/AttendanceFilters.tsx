"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { coursesApi } from "@/lib/api"
import type { Course } from "@/types/api"

interface AttendanceFiltersProps {
  onFiltersChange: (filters: {
    codigo_curso: string
    fecha: string
    ci_estudiante: string
  }) => void
}

export function AttendanceFilters({ onFiltersChange }: AttendanceFiltersProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [filters, setFilters] = useState({
    codigo_curso: "",
    fecha: "",
    ci_estudiante: "",
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchCourses()
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      codigo_curso: "",
      fecha: "",
      ci_estudiante: "",
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
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label>Fecha</Label>
              <Input type="date" value={filters.fecha} onChange={(e) => handleFilterChange("fecha", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>CI Estudiante</Label>
              <Input
                placeholder="Buscar por CI"
                value={filters.ci_estudiante}
                onChange={(e) => handleFilterChange("ci_estudiante", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
