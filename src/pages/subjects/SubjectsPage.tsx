"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { SubjectForm } from "./components/SubjectForm"
import { SubjectDetails } from "./components/SubjectDetails"
import { subjectsApi } from "@/lib/api"
import { PERMISSIONS } from "@/lib/permissions"
import type { Subject } from "@/types/api"

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll()
      setSubjects(response.results)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedSubject(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (subject: Subject) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta materia?")) {
      try {
        await subjectsApi.delete(subject.codigo)
        await fetchSubjects()
      } catch (error) {
        console.error("Error deleting subject:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchSubjects()
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
      render: (value: string, subject: Subject) => (
        <div>
          <div className="font-medium">{subject.nombre}</div>
          {subject.descripcion && <div className="text-sm text-muted-foreground">{subject.descripcion}</div>}
        </div>
      ),
      sortable: true,
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? "Activa" : "Inactiva"}</Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Materias</h2>
          <p className="text-muted-foreground">Gestiona la información de las materias</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_SUBJECT}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Materia
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={subjects}
        columns={columns}
        searchPlaceholder="Buscar materias..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_SUBJECT}
        deletePermission={PERMISSIONS.DELETE_SUBJECT}
      />

      <SubjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        subject={selectedSubject}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <SubjectDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} subject={selectedSubject} />
    </div>
  )
}
