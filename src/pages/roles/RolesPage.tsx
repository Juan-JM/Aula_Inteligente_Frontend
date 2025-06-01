"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { RoleForm } from "./components/RoleForm"
import { RoleDetails } from "./components/RoleDetails"
import { rolesApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { Role } from "@/types/api"

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await rolesApi.getAll()
      setRoles(response.results)
    } catch (error) {
      console.error("Error fetching roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedRole(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (role: Role) => {
    setSelectedRole(role)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (role: Role) => {
    if (confirm("¿Estás seguro de que deseas eliminar este rol?")) {
      try {
        await rolesApi.delete(role.id)
        await fetchRoles()
      } catch (error) {
        console.error("Error deleting role:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchRoles()
  }

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Nombre",
      render: (value: string, role: Role) => (
        <div>
          <div className="font-medium">{role.name}</div>
          <div className="text-sm text-muted-foreground">{role.permissions.length} permisos</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "user_count",
      label: "Usuarios",
      render: (value: number) => <Badge variant="outline">{value || 0} usuarios</Badge>,
    },
    {
      key: "permissions",
      label: "Permisos",
      render: (value: any, role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((permission) => (
            <Badge key={permission.id} variant="secondary" className="text-xs">
              {permission.codename}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 3} más
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
          <p className="text-muted-foreground">Gestiona los roles y permisos del sistema</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.MANAGE_GROUPS}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Rol
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        searchPlaceholder="Buscar roles..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <RoleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        role={selectedRole}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <RoleDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} role={selectedRole} />
    </div>
  )
}
