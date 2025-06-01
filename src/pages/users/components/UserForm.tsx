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
import { usersApi, rolesApi } from "@/lib/api"
import type { User, Role } from "@/types/api"

// Esquema corregido con validación condicional
const userSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  email: z.string().email("Email inválido"),
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  password: z.string().optional(),
  password_confirm: z.string().optional(),
  is_active: z.boolean().optional(),
  is_staff: z.boolean().optional(),
  is_superuser: z.boolean().optional(),
  groups: z.array(z.number()).optional(),
}).refine((data) => {
  // Si se proporciona password, debe tener al menos 6 caracteres
  if (data.password && data.password.length < 6) {
    return false;
  }
  // Si se proporciona password_confirm, debe tener al menos 6 caracteres
  if (data.password_confirm && data.password_confirm.length < 6) {
    return false;
  }
  // Si se proporciona una, se debe proporcionar la otra
  if (data.password || data.password_confirm) {
    return data.password === data.password_confirm;
  }
  return true;
}, {
  message: "Las contraseñas deben coincidir y tener al menos 6 caracteres",
  path: ["password_confirm"]
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function UserForm({ open, onOpenChange, user, mode, onSuccess }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [userFlags, setUserFlags] = useState({
    is_active: true,
    is_staff: false,
    is_superuser: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    if (user && mode === "edit") {
      reset({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      })
      setSelectedRoles(user.groups.map((g) => g.id))
      setUserFlags({
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
      })
    } else {
      reset({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        password_confirm: "",
      })
      setSelectedRoles([])
      setUserFlags({
        is_active: true,
        is_staff: false,
        is_superuser: false,
      })
    }
  }, [user, mode, reset])

  const fetchRoles = async () => {
    try {
      const response = await rolesApi.getAll()
      setRoles(response.results)
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId])
    } else {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId))
    }
  }

  const handleFlagChange = (flag: keyof typeof userFlags, checked: boolean) => {
    setUserFlags({ ...userFlags, [flag]: checked })
  }

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      const userData = {
        ...data,
        groups: selectedRoles,
        ...userFlags,
      }

      // Para crear: la contraseña es obligatoria
      if (mode === "create") {
        if (!data.password || data.password.length < 6) {
          throw new Error("La contraseña es obligatoria y debe tener al menos 6 caracteres");
        }
      }

      // Para edición: solo incluir contraseña si se proporciona
      if (mode === "edit" && (!data.password || data.password.trim() === "")) {
        delete userData.password;
        delete userData.password_confirm;
      }

      console.log("Datos enviados:", userData); // Para debug

      if (mode === "edit" && user) {
        await usersApi.update(user.id, userData)
      } else {
        await usersApi.create(userData)
      }
      
      onSuccess()
      reset()
      setSelectedRoles([])
      setUserFlags({
        is_active: true,
        is_staff: false,
        is_superuser: false,
      })
    } catch (error) {
      console.error("Error saving user:", error)
      // Aquí podrías mostrar un toast o mensaje de error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del usuario y sus roles"
              : "Completa la información para agregar un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input id="username" {...register("username")} error={errors.username?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" {...register("first_name")} error={errors.first_name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" {...register("last_name")} error={errors.last_name?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "edit" ? "Nueva Contraseña (opcional)" : "Contraseña *"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
              placeholder={mode === "edit" ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirm">
              {mode === "edit" ? "Confirmar Nueva Contraseña" : "Confirmar Contraseña *"}
            </Label>
            <Input
              id="password_confirm"
              type="password"
              {...register("password_confirm")}
              error={errors.password_confirm?.message}
              placeholder={mode === "edit" ? "Dejar vacío para mantener la actual" : "Repetir contraseña"}
            />
          </div>
          
          {/* Flags del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Permisos del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={userFlags.is_active}
                  onCheckedChange={(checked) => handleFlagChange("is_active", checked as boolean)}
                />
                <Label htmlFor="is_active" className="text-sm">
                  Usuario activo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_staff"
                  checked={userFlags.is_staff}
                  onCheckedChange={(checked) => handleFlagChange("is_staff", checked as boolean)}
                />
                <Label htmlFor="is_staff" className="text-sm">
                  Miembro del staff (puede acceder al admin)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_superuser"
                  checked={userFlags.is_superuser}
                  onCheckedChange={(checked) => handleFlagChange("is_superuser", checked as boolean)}
                />
                <Label htmlFor="is_superuser" className="text-sm">
                  Superusuario (todos los permisos)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Roles Asignados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                  />
                  <Label htmlFor={`role-${role.id}`} className="text-sm">
                    {role.name}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

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