"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/DataTable"
import { FormDialog } from "@/components/common/FormDialog"
import { studentsApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import type { Student } from "@/types/api"

export function Students() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

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
    setIsDialogOpen(true)
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsDialogOpen(true)
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Estudiantes</h2>
        <p className="text-muted-foreground">Gestiona la información de los estudiantes</p>
      </div>

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="Buscar estudiantes..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Agregar Estudiante"
        isLoading={isLoading}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedStudent ? "Editar Estudiante" : "Agregar Estudiante"}
        description={
          selectedStudent
            ? "Modifica la información del estudiante"
            : "Completa la información para agregar un nuevo estudiante"
        }
      >
        <div className="text-center py-8 text-muted-foreground">Formulario de estudiante en desarrollo...</div>
      </FormDialog>
    </div>
  )
}
