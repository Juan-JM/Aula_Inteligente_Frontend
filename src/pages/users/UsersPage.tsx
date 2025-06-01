"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/common/DataTable"
import { PermissionGuard } from "@/components/common/PermissionGuard"
import { UserForm } from "./components/UserForm"
import { UserDetails } from "./components/UserDetails"
import { usersAdminApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { PERMISSIONS } from "@/lib/permissions"
import type { User } from "@/types/api"

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await usersAdminApi.getAll()
      setUsers(response.results)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await usersAdminApi.delete(user.id)
        await fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchUsers()
  }

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "username",
      label: "Usuario",
      render: (value: string, user: User) => (
        <div>
          <div className="font-medium">@{user.username}</div>
          <div className="text-sm text-muted-foreground">
            {user.first_name} {user.last_name}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "groups",
      label: "Roles",
      render: (value: any, user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.groups.slice(0, 2).map((group) => (
            <Badge key={group.id} variant="secondary" className="text-xs">
              {group.name}
            </Badge>
          ))}
          {user.groups.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{user.groups.length - 2} más
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (value: boolean, user: User) => (
        <div className="flex flex-col gap-1">
          <Badge variant={value ? "default" : "secondary"}>{value ? "Activo" : "Inactivo"}</Badge>
          {user.is_staff && (
            <Badge variant="outline" className="text-xs">
              Staff
            </Badge>
          )}
          {user.is_superuser && (
            <Badge variant="destructive" className="text-xs">
              Superuser
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "date_joined",
      label: "Fecha de Registro",
      render: (value: string) => formatDate(value),
      sortable: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADD_USER}>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Usuario
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Buscar usuarios..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        editPermission={PERMISSIONS.CHANGE_USER}
        deletePermission={PERMISSIONS.DELETE_USER}
      />

      <UserForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      <UserDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} user={selectedUser} />
    </div>
  )
}
