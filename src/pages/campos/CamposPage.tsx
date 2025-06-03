"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/common/DataTable"
import { FormDialog } from "@/components/common/FormDialog"
import { CampoForm } from "./components/CampoForm"
import { CampoDetails } from "./components/CampoDetails"
import { camposApi } from "@/lib/api"
import type { Campo } from "@/types/api"
import { useAuth } from "@/contexts/AuthContext"
import { canAddCourses, canManageCourses, canDeleteCourses, PERMISSIONS } from "@/lib/permissions"
import { useToast } from "@/components/ui/use-toast"

export function CamposPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [campos, setCampos] = useState<Campo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCampo, setSelectedCampo] = useState<Campo | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetchCampos = async () => {
    try {
      setIsLoading(true)
      const response = await camposApi.getAll({
        search: searchTerm,
        ordering: "nombre",
      })
      setCampos(response.results)
    } catch (error) {
      console.error("Error fetching campos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los campos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampos()
  }, [searchTerm])

  const handleCreate = () => {
    setSelectedCampo(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleEdit = (campo: Campo) => {
    setSelectedCampo(campo)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleView = (campo: Campo) => {
    setSelectedCampo(campo)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (campo: Campo) => {
    if (window.confirm(`¿Está seguro de eliminar el campo "${campo.nombre}"?`)) {
      try {
        await camposApi.delete(campo.codigo)
        toast({
          title: "Éxito",
          description: "Campo eliminado correctamente",
        })
        fetchCampos()
      } catch (error) {
        console.error("Error deleting campo:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el campo",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchCampos()
    toast({
      title: "Éxito",
      description: isEditing ? "Campo actualizado correctamente" : "Campo creado correctamente",
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
      key: "valor",
      label: "Valor (%)",
      render: (value: number) => `${value}%`,
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
          <h1 className="text-3xl font-bold tracking-tight">Campos</h1>
          <p className="text-muted-foreground">Gestión de campos de evaluación</p>
        </div>
        {canAddCourses(user) && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Campo
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        data={campos}
        columns={columns}
        searchPlaceholder="Buscar campos..."
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
        title={isEditing ? "Editar Campo" : "Nuevo Campo"}
        description={isEditing ? "Modifica los datos del campo" : "Crea un nuevo campo de evaluación"}
      >
        <CampoForm campo={selectedCampo} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </FormDialog>

      <FormDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Detalles del Campo"
        description="Información completa del campo"
      >
        {selectedCampo && <CampoDetails campo={selectedCampo} />}
      </FormDialog>
    </div>
  )
}
