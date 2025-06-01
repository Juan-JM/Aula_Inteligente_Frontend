"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { TeacherForm } from "./components/TeacherForm"
import { TeacherDetails } from "./components/TeacherDetails"
import { teachersApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import type { Teacher } from "@/types/api"
import { PERMISSIONS } from "@/lib/permissions"

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await teachersApi.getAll()
      setTeachers(response.results)
    } catch (error) {
      console.error("Error fetching teachers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedTeacher(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (teacher: Teacher) => {
    if (confirm("¿Estás seguro de que deseas eliminar este docente?")) {
      try {
        await teachersApi.delete(teacher.ci)
        await fetchTeachers()
      } catch (error) {
        console.error("Error deleting teacher:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchTeachers()
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
      render: (value: string, teacher: Teacher) => (
        <div>
          <div className="font-medium">
            {teacher.nombre} {teacher.apellido}
          </div>
          <div className="text-sm text-muted-foreground">{teacher.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "especialidad",
      label: "Especialidad",
      render: (value: string) => value || <span className="text-muted-foreground">No especificada</span>,
    },
    {
      key: "telefono",
      label: "Teléfono",
    },
    {
      key: "fecha_ingreso",
      label: "Fecha de Ingreso",
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
          <h2 className="text-3xl font-bold tracking-tight">Docentes</h2>
          <p className="text-muted-foreground">Gestiona la información de los docentes</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_TEACHER}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Docente
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={teachers}
        columns={columns}
        searchPlaceholder="Buscar docentes..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_TEACHER}
        deletePermission={PERMISSIONS.DELETE_TEACHER}
      />

      <TeacherForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teacher={selectedTeacher}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <TeacherDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} teacher={selectedTeacher} />
    </div>
  )
}
