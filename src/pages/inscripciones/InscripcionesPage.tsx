"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { InscripcionForm } from "./components/InscripcionForm"
import { InscripcionDetails } from "./components/InscripcionDetails"
import { inscripcionesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Inscripcion } from "@/types/api"

export function InscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedInscripcion, setSelectedInscripcion] = useState<Inscripcion | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchInscripciones()
  }, [])

  const fetchInscripciones = async () => {
    try {
      const response = await inscripcionesApi.getAll()
      setInscripciones(response.results)
    } catch (error) {
      console.error("Error fetching inscripciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedInscripcion(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (inscripcion: Inscripcion) => {
    setSelectedInscripcion(inscripcion)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (inscripcion: Inscripcion) => {
    setSelectedInscripcion(inscripcion)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (inscripcion: Inscripcion) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta inscripción?")) {
      try {
        await inscripcionesApi.delete(inscripcion.id)
        await fetchInscripciones()
      } catch (error) {
        console.error("Error deleting inscripcion:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchInscripciones()
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "default"
      case "RETIRADO":
        return "destructive"
      case "TRASLADADO":
        return "secondary"
      default:
        return "outline"
    }
  }

  const columns = [
    {
      key: "estudiante_nombre",
      label: "Estudiante",
      sortable: true,
    },
    {
      key: "curso_nombre",
      label: "Curso",
      sortable: true,
    },
    {
      key: "fecha_inscripcion",
      label: "Fecha de Inscripción",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={getEstadoBadgeVariant(value)}>{value}</Badge>,
    },
    {
      key: "fecha_baja",
      label: "Fecha de Baja",
      render: (value: string) => (value ? formatDate(value) : "-"),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inscripciones</h2>
          <p className="text-muted-foreground">Gestiona las inscripciones de estudiantes a cursos</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_STUDENT}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Inscripción
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={inscripciones}
        columns={columns}
        searchPlaceholder="Buscar inscripciones..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <InscripcionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        inscripcion={selectedInscripcion}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <InscripcionDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} inscripcion={selectedInscripcion} />
    </div>
  )
}
