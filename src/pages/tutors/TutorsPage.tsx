"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { TutorForm } from "./components/TutorForm"
import { TutorDetails } from "./components/TutorDetails"
import { tutorsApi } from "@/lib/api"
import { PERMISSIONS } from "@/lib/permissions"
import type { Tutor } from "@/types/api"

export function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    try {
      const response = await tutorsApi.getAll()
      setTutors(response.results)
    } catch (error) {
      console.error("Error fetching tutors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedTutor(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (tutor: Tutor) => {
    setSelectedTutor(tutor)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (tutor: Tutor) => {
    if (confirm("¿Estás seguro de que deseas eliminar este tutor?")) {
      try {
        await tutorsApi.delete(tutor.ci)
        await fetchTutors()
      } catch (error) {
        console.error("Error deleting tutor:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchTutors()
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
      render: (value: string, tutor: Tutor) => (
        <div>
          <div className="font-medium">
            {tutor.nombre} {tutor.apellido}
          </div>
          <div className="text-sm text-muted-foreground">{tutor.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "telefono",
      label: "Teléfono",
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (value: string) => value || <span className="text-muted-foreground">No especificada</span>,
    },
    {
      key: "estudiantes",
      label: "Estudiantes",
      render: (value: any, tutor: Tutor) => (
        <Badge variant="outline">{tutor.estudiantes_asignados?.length || 0} estudiantes</Badge>
      ),
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
          <h2 className="text-3xl font-bold tracking-tight">Tutores</h2>
          <p className="text-muted-foreground">Gestiona la información de los tutores</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_TUTOR}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Tutor
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={tutors}
        columns={columns}
        searchPlaceholder="Buscar tutores..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_TUTOR}
        deletePermission={PERMISSIONS.DELETE_TUTOR}
      />

      <TutorForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tutor={selectedTutor}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <TutorDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} tutor={selectedTutor} />
    </div>
  )
}
