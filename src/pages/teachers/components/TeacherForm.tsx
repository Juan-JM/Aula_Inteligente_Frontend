"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { teachersApi, authApi, rolesApi } from "@/lib/api"
import type { Teacher, User } from "@/types/api"

const teacherSchema = z.object({
  ci: z.string().min(6, "La CI debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  fecha_ingreso: z.string().min(1, "La fecha de ingreso es requerida"),
  especialidad: z.string().optional(),
  titulo: z.string().optional(),
  crear_usuario: z.boolean().optional(),
  usuario_id: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

interface TeacherFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function TeacherForm({ open, onOpenChange, teacher, mode, onSuccess }: TeacherFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [createUser, setCreateUser] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  const selectedUserId = watch("usuario_id")

  useEffect(() => {
    if (mode === "create") {
      fetchAvailableUsers()
    }
  }, [mode])

  useEffect(() => {
    if (teacher && mode === "edit") {
      reset({
        ci: teacher.ci,
        nombre: teacher.nombre,
        apellido: teacher.apellido,
        email: teacher.email,
        telefono: teacher.telefono,
        fecha_ingreso: teacher.fecha_ingreso,
        especialidad: teacher.especialidad || "",
        titulo: teacher.titulo || "",
      })

      // Si el docente tiene usuario asignado, obtener su información
      if (teacher.usuario_username) {
        setCurrentUserId(teacher.usuario_username)
        fetchAvailableUsers() // Para poder cambiar el usuario
      }
    } else {
      reset({
        ci: "",
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fecha_ingreso: "",
        especialidad: "",
        titulo: "",
        usuario_id: "",
      })
      setCurrentUserId("")
    }
  }, [teacher, mode, reset])

  const fetchAvailableUsers = async () => {
    try {
      const response = await authApi.getAvailableUsers("Docente")
      setAvailableUsers(response.results || [])
    } catch (error) {
      console.error("Error fetching available users:", error)
    }
  }

  const onSubmit = async (data: TeacherFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && teacher) {
        // Actualizar docente
        await teachersApi.update(teacher.ci, data)

        // Manejar cambio de usuario si es necesario
        if (data.usuario_id && data.usuario_id !== currentUserId) {
          // Desasignar usuario actual si existe
          if (currentUserId) {
            await teachersApi.unassignUser(teacher.ci)
          }
          // Asignar nuevo usuario
          const selectedUser = availableUsers.find((u) => u.username === data.usuario_id)
          if (selectedUser) {
            await teachersApi.assignUser(teacher.ci, selectedUser.id)
          }
        } else if (!data.usuario_id && currentUserId) {
          // Desasignar usuario si se removió la selección
          await teachersApi.unassignUser(teacher.ci)
        }
      } else {
        // Crear docente
        const newTeacher = await teachersApi.create(data)
        const rolesResponse = await rolesApi.getAll()
        const docenteGroup = rolesResponse.results.find(
          group => group.name.toLowerCase() === "docente"
        )

        if (!docenteGroup) {
          throw new Error("No se encontró el grupo 'Docente'")
        }

        // Manejar asignación de usuario
        if (data.crear_usuario) {
          // Crear usuario automáticamente
          try {
            const userData = {
              username: data.ci,
              email: data.email,
              first_name: data.nombre,
              last_name: data.apellido,
              password: `DOC.${data.ci}`,
              password_confirm: `DOC.${data.ci}`,
              groups: [docenteGroup.id], // ✅ Asigna automáticamente el grupo Docente
            }

            const newUser = await authApi.register(userData)
            await teachersApi.assignUser(data.ci, newUser.id)
          } catch (userError) {
            console.error("Error creating user:", userError)
            // El docente se creó pero falló la creación del usuario
            // Podrías mostrar un mensaje de advertencia aquí
          }
        } else if (data.usuario_id) {
          // Asignar usuario existente
          const selectedUser = availableUsers.find((u) => u.username === data.usuario_id)
          if (selectedUser) {
            await teachersApi.assignUser(data.ci, selectedUser.id)
          }
        }
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving teacher:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Docente" : "Agregar Docente"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del docente"
              : "Completa la información para agregar un nuevo docente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci">CI</Label>
              <Input id="ci" {...register("ci")} disabled={mode === "edit"} placeholder="Ej: 87654321" />
              {errors.ci && <p className="text-sm text-destructive">{errors.ci.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="docente@colegio.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Carlos" />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register("apellido")} placeholder="García" />
              {errors.apellido && <p className="text-sm text-destructive">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} placeholder="+59171234567" />
              {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
              <Input id="fecha_ingreso" type="date" {...register("fecha_ingreso")} />
              {errors.fecha_ingreso && <p className="text-sm text-destructive">{errors.fecha_ingreso.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input id="especialidad" {...register("especialidad")} placeholder="Matemáticas (Opcional)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" {...register("titulo")} placeholder="Licenciado en Matemáticas (Opcional)" />
            </div>
          </div>

          {/* Gestión de Usuario */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Gestión de Usuario</h4>

            {mode === "edit" && (
              <div className="space-y-2">
                <Label>Usuario Actual</Label>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {currentUserId ? (
                    <p>
                      <strong>Usuario asignado:</strong> {currentUserId}
                    </p>
                  ) : (
                    <p>No tiene usuario asignado</p>
                  )}
                </div>
              </div>
            )}

            {mode === "create" && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crear_usuario"
                    checked={createUser}
                    onCheckedChange={(checked) => {
                      setCreateUser(checked as boolean)
                      setValue("crear_usuario", checked as boolean)
                      if (checked) {
                        setValue("usuario_id", "")
                      }
                    }}
                  />
                  <Label
                    htmlFor="crear_usuario"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Crear usuario automáticamente
                  </Label>
                </div>
                {createUser && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    <p>
                      <strong>Usuario:</strong> {watch("ci") || "[CI]"}
                    </p>
                    <p>
                      <strong>Contraseña:</strong> DOC.{watch("ci") || "[CI]"}
                    </p>
                    <p className="text-xs mt-1">
                      El docente podrá cambiar su contraseña después del primer inicio de sesión.
                    </p>
                  </div>
                )}
              </div>
            )}

            {((mode === "create" && !createUser) || mode === "edit") && (
              <div className="space-y-2">
                <Label htmlFor="usuario_id">{mode === "edit" ? "Cambiar Usuario" : "Asignar Usuario Existente"}</Label>
                <Select value={selectedUserId} onValueChange={(value) => setValue("usuario_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin usuario</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.username}>
                        {user.username} - {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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