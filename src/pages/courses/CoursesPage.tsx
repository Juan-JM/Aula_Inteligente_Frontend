"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { CourseForm } from "./components/CourseForm"
import { CourseDetails } from "./components/CourseDetails"
import { coursesApi } from "@/lib/api"
import { PERMISSIONS } from "@/lib/permissions"
import type { Course } from "@/types/api"

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedCourse(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (course: Course) => {
    setSelectedCourse(course)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (course: Course) => {
    setSelectedCourse(course)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (course: Course) => {
    if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      try {
        await coursesApi.delete(course.codigo)
        await fetchCourses()
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchCourses()
  }

  const columns = [
    {
      key: "codigo",
      label: "Código",
      sortable: true,
    },
    {
      key: "nombre",
      label: "Nombre",
      render: (value: string, course: Course) => (
        <div>
          <div className="font-medium">{course.nombre}</div>
          <div className="text-sm text-muted-foreground">
            {course.nivel} "{course.paralelo}" - Gestión {course.gestion}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "total_estudiantes",
      label: "Estudiantes",
      render: (value: number) => <Badge variant="outline">{value || 0} estudiantes</Badge>,
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? "Activo" : "Inactivo"}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cursos</h2>
          <p className="text-muted-foreground">Gestiona la información de los cursos</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_COURSE}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Curso
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={courses}
        columns={columns}
        searchPlaceholder="Buscar cursos..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_COURSE}
        deletePermission={PERMISSIONS.DELETE_COURSE}
      />

      <CourseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        course={selectedCourse}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <CourseDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} course={selectedCourse} />
    </div>
  )
}
