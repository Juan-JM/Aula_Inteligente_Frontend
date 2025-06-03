"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/common/DataTable"
import { FormDialog } from "@/components/common/FormDialog"
import { PeriodoForm } from "./components/PeriodoForm"
import { PeriodoDetails } from "./components/PeriodoDetails"
import { periodosApi } from "@/lib/api"
import type { Periodo } from "@/types/api"
import { useAuth } from "@/contexts/AuthContext"
import { canAddCourses, canManageCourses, canDeleteCourses, PERMISSIONS } from "@/lib/permissions"
import { useToast } from "@/components/ui/use-toast"

export function PeriodosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetchPeriodos = async () => {
    try {
      setIsLoading(true)
      const response = await periodosApi.getAll({
        search: searchTerm,
        ordering: "-created_at",
      })
      setPeriodos(response.results)
    } catch (error) {
      console.error("Error fetching periodos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los períodos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriodos()
  }, [searchTerm])

  const handleCreate = () => {
    setSelectedPeriodo(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleEdit = (periodo: Periodo) => {
    setSelectedPeriodo(periodo)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleView = (periodo: Periodo) => {
    setSelectedPeriodo(periodo)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (periodo: Periodo) => {
    if (window.confirm(`¿Está seguro de eliminar el período "${periodo.nombre}"?`)) {
      try {
        await periodosApi.delete(periodo.codigo)
        toast({
          title: "Éxito",
          description: "Período eliminado correctamente",
        })
        fetchPeriodos()
      } catch (error) {
        console.error("Error deleting periodo:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el período",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchPeriodos()
    toast({
      title: "Éxito",
      description: isEditing ? "Período actualizado correctamente" : "Período creado correctamente",
    })
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
      sortable: true,
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Períodos</h1>
          <p className="text-muted-foreground">Gestión de períodos académicos</p>
        </div>
        {canAddCourses(user) && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Período
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar períodos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        data={periodos}
        columns={columns}
        searchPlaceholder="Buscar períodos..."
        onView={handleView}
        onEdit={canManageCourses(user) ? handleEdit : undefined}
        onDelete={canDeleteCourses(user) ? handleDelete : undefined}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_COURSE}
        deletePermission={PERMISSIONS.DELETE_COURSE}
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={isEditing ? "Editar Período" : "Nuevo Período"}
        description={isEditing ? "Modifica los datos del período" : "Crea un nuevo período académico"}
      >
        <PeriodoForm periodo={selectedPeriodo} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </FormDialog>

      <FormDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Detalles del Período"
        description="Información completa del período"
      >
        {selectedPeriodo && <PeriodoDetails periodo={selectedPeriodo} />}
      </FormDialog>
    </div>
  )
}
