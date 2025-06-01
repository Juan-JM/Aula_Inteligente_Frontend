"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Upload } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { ParticipationForm } from "./components/ParticipationForm"
import { ParticipationDetails } from "./components/ParticipationDetails"
import { ParticipationFilters } from "./components/ParticipationFilters"
import { BulkParticipationForm } from "./components/BulkParticipationForm"
import { ParticipationStats } from "./components/ParticipationStats"
import { participationApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Participation } from "@/types/api"

export function ParticipationPage() {
  const [participations, setParticipations] = useState<Participation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [filters, setFilters] = useState({
    codigo_curso: "",
    codigo_materia: "",
    ci_estudiante: "",
    fecha: "",
    tipo_participacion: "",
  })

  useEffect(() => {
    fetchParticipations()
  }, [filters])

  const fetchParticipations = async () => {
    try {
      const response = await participationApi.getAll(filters)
      setParticipations(response.results)
    } catch (error) {
      console.error("Error fetching participations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedParticipation(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleBulkAdd = () => {
    setIsBulkFormOpen(true)
  }

  const handleEdit = (participation: Participation) => {
    setSelectedParticipation(participation)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (participation: Participation) => {
    setSelectedParticipation(participation)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (participation: Participation) => {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de participación?")) {
      try {
        await participationApi.delete(participation.id)
        await fetchParticipations()
      } catch (error) {
        console.error("Error deleting participation:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setIsBulkFormOpen(false)
    fetchParticipations()
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const getParticipationBadge = (calificacion: number) => {
    if (calificacion >= 4.5) return <Badge variant="default">Excelente</Badge>
    if (calificacion >= 3.5) return <Badge variant="secondary">Bueno</Badge>
    if (calificacion >= 2.5) return <Badge variant="outline">Regular</Badge>
    return <Badge variant="destructive">Deficiente</Badge>
  }

  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
    {
      key: "estudiante_nombre",
      label: "Estudiante",
      render: (value: string, participation: Participation) => (
        <div>
          <div className="font-medium">{participation.estudiante_nombre}</div>
          <div className="text-sm text-muted-foreground">CI: {participation.ci_estudiante}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "materia_nombre",
      label: "Materia",
      render: (value: string, participation: Participation) => (
        <div>
          <div className="font-medium">{participation.materia_nombre}</div>
          <div className="text-sm text-muted-foreground">{participation.curso_nombre}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "tipo_participacion",
      label: "Tipo",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "calificacion",
      label: "Calificación",
      render: (value: number, participation: Participation) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">{value.toFixed(1)}/5.0</span>
          {getParticipationBadge(value)}
        </div>
      ),
      sortable: true,
    },
    {
      key: "observaciones",
      label: "Observaciones",
      render: (value: string) => (
        <span className="text-sm">
          {value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : "Sin observaciones"}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Participación</h2>
          <p className="text-muted-foreground">Gestiona el registro de participación de los estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsStatsOpen(true)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Estadísticas
          </Button>
          <PermissionGuard permission={PERMISSIONS.ADD_PARTICIPATION}>
            <Button variant="outline" onClick={handleBulkAdd}>
              <Upload className="mr-2 h-4 w-4" />
              Registro Masivo
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Participación
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <ParticipationFilters onFiltersChange={handleFiltersChange} />

      <DataTable
        data={participations}
        columns={columns}
        searchPlaceholder="Buscar registros de participación..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_PARTICIPATION}
        deletePermission={PERMISSIONS.DELETE_PARTICIPATION}
      />

      <ParticipationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        participation={selectedParticipation}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <BulkParticipationForm open={isBulkFormOpen} onOpenChange={setIsBulkFormOpen} onSuccess={handleFormSuccess} />

      <ParticipationDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        participation={selectedParticipation}
      />

      <ParticipationStats open={isStatsOpen} onOpenChange={setIsStatsOpen} />
    </div>
  )
}
