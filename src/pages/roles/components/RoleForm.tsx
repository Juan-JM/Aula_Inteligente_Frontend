"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { rolesApi } from "@/lib/api"
import type { Role, Permission } from "@/types/api"

const roleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  permissions: z.array(z.number()).optional(),
})

type RoleFormData = z.infer<typeof roleSchema>

interface RoleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function RoleForm({ open, onOpenChange, role, mode, onSuccess }: RoleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
  })

  useEffect(() => {
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (role && mode === "edit") {
      reset({
        name: role.name,
      })
      setSelectedPermissions(role.permissions.map((p) => p.id))
    } else {
      reset({
        name: "",
      })
      setSelectedPermissions([])
    }
  }, [role, mode, reset])

  const fetchPermissions = async () => {
    try {
      const response = await rolesApi.getPermissions()
      
      // Debug: ver qué está devolviendo el API
      console.log("API Response:", response)
      
      // Manejar diferentes formatos de respuesta del API
      let permissionsData: Permission[] = []
      
      if (Array.isArray(response)) {
        // Si ya es un array
        permissionsData = response
      } else if (response && response.results && Array.isArray(response.results)) {
        // Si es paginado (formato DRF)
        permissionsData = response.results
      } else if (response && response.data && Array.isArray(response.data)) {
        // Si viene en un objeto data
        permissionsData = response.data
      } else {
        console.error("Formato de respuesta inesperado:", response)
        permissionsData = []
      }
      
      setPermissions(permissionsData)
    } catch (error) {
      console.error("Error fetching permissions:", error)
      setPermissions([]) // Establecer array vacío en caso de error
    }
  }

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const onSubmit = async (data: RoleFormData) => {
    setIsLoading(true)
    try {
      const roleData = {
        ...data,
        permissions: selectedPermissions,
      }

      if (mode === "edit" && role) {
        await rolesApi.update(role.id, roleData)
      } else {
        await rolesApi.create(roleData)
      }
      onSuccess()
      reset()
      setSelectedPermissions([])
    } catch (error) {
      console.error("Error saving role:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Agrupar permisos por content_type (app)
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      // Usar content_type para agrupar (formato correcto de Django)
      const app = permission.content_type?.app_label || permission.content_type?.model || "general"
      if (!acc[app]) {
        acc[app] = []
      }
      acc[app].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Rol" : "Agregar Rol"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del rol y sus permisos"
              : "Completa la información para agregar un nuevo rol"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-4">
            <Label>Permisos ({permissions.length} disponibles)</Label>
            
            {permissions.length === 0 ? (
              <p className="text-gray-500">Cargando permisos...</p>
            ) : (
              <div className="grid gap-4">
                {Object.entries(groupedPermissions).map(([app, appPermissions]) => (
                  <Card key={app}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm capitalize">
                        {app} ({appPermissions.length} permisos)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {appPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                          />
                          <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                            {permission.name}
                            <span className="text-xs text-gray-500 block">
                              {permission.codename}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
