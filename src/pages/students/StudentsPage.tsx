"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { StudentForm } from "./components/StudentForm"
import { StudentDetails } from "./components/StudentDetails"
import { studentsApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Student } from "@/types/api"

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await studentsApi.getAll()
      setStudents(response.results)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (student: Student) => {
    if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
      try {
        await studentsApi.delete(student.ci)
        await fetchStudents()
      } catch (error) {
        console.error("Error deleting student:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchStudents()
  }

  const columns = [
    {
      key: "ci",
      label: "CI",
      sortable: true,
    },
    {
      key: "nombre",
      label: "Nombre",
      render: (value: string, student: Student) => (
        <div>
          <div className="font-medium">
            {student.nombre} {student.apellido}
          </div>
          <div className="text-sm text-muted-foreground">{student.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "curso_actual.nombre",
      label: "Curso",
      render: (value: string, student: Student) =>
        student.curso_actual ? (
          <Badge variant="secondary">{student.curso_actual.nombre}</Badge>
        ) : (
          <span className="text-muted-foreground">Sin curso</span>
        ),
    },
    {
      key: "fecha_nacimiento",
      label: "Fecha de Nacimiento",
      render: (value: string) => formatDate(value),
      sortable: true,
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
          <h2 className="text-3xl font-bold tracking-tight">Estudiantes</h2>
          <p className="text-muted-foreground">Gestiona la información de los estudiantes</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_STUDENT}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Estudiante
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Buscar estudiantes..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <StudentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <StudentDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} student={selectedStudent} />
    </div>
  )
}
