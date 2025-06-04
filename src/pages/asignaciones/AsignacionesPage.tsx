"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { AsignacionForm } from "./components/AsignacionForm"
import { asignacionesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Asignacion } from "@/types/api"

export function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    fetchAsignaciones()
  }, [])

  const fetchAsignaciones = async () => {
    try {
      const response = await asignacionesApi.getAll()
      setAsignaciones(response.results)
    } catch (error) {
      console.error("Error fetching asignaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setIsFormOpen(true)
  }

  const handleDelete = async (asignacion: Asignacion) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta asignación?")) {
      try {
        await asignacionesApi.delete(asignacion.id)
        await fetchAsignaciones()
      } catch (error) {
        console.error("Error deleting asignacion:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchAsignaciones()
  }

  const columns = [
    {
      key: "docente_nombre",
      label: "Docente",
      sortable: true,
    },
    {
      key: "materia_nombre",
      label: "Materia",
      sortable: true,
    },
    {
      key: "curso_nombre",
      label: "Curso",
      sortable: true,
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? "Activo" : "Inactivo"}</Badge>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Asignación",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asignaciones</h2>
          <p className="text-muted-foreground">Gestiona las asignaciones de docentes a materias y cursos</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_TEACHER}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignación
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={asignaciones}
        columns={columns}
        searchPlaceholder="Buscar asignaciones..."
        onDelete={handleDelete}
        isLoading={isLoading}
        showEdit={false}
        showView={false}
      />

      <AsignacionForm open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={handleFormSuccess} />
    </div>
  )
}
