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
import { studentsApi, coursesApi, authApi, rolesApi } from "@/lib/api"
import type { Student, Course, User } from "@/types/api"

const studentSchema = z.object({
  ci: z.string().min(6, "La CI debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  codigo_curso: z.string().min(1, "El curso es requerido"),
  crear_usuario: z.boolean().optional(),
  usuario_id: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function StudentForm({ open, onOpenChange, student, mode, onSuccess }: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
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
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  const selectedCourse = watch("codigo_curso")
  const selectedUserId = watch("usuario_id")

  useEffect(() => {
    fetchCourses()
    if (mode === "create") {
      fetchAvailableUsers()
    }
  }, [mode])

  useEffect(() => {
    if (student && mode === "edit") {
      reset({
        ci: student.ci,
        nombre: student.nombre,
        apellido: student.apellido,
        email: student.email,
        fecha_nacimiento: student.fecha_nacimiento,
        codigo_curso: student.curso_actual?.codigo || "",
      })

      // Si el estudiante tiene usuario asignado, obtener su información
      if (student.usuario_username) {
        setCurrentUserId(student.usuario_username)
        fetchAvailableUsers() // Para poder cambiar el usuario
      }
    } else {
      reset({
        ci: "",
        nombre: "",
        apellido: "",
        email: "",
        fecha_nacimiento: "",
        codigo_curso: "",
        usuario_id: "",
      })
      setCurrentUserId("")
    }
  }, [student, mode, reset])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await authApi.getAvailableUsers("Estudiante")
      setAvailableUsers(response.results || [])
    } catch (error) {
      console.error("Error fetching available users:", error)
    }
  }

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && student) {
        // Actualizar estudiante
        await studentsApi.update(student.ci, data)

        // Manejar cambio de usuario si es necesario
        if (data.usuario_id && data.usuario_id !== currentUserId) {
          // Desasignar usuario actual si existe
          if (currentUserId) {
            await studentsApi.unassignUser(student.ci)
          }
          // Asignar nuevo usuario
          const selectedUser = availableUsers.find((u) => u.username === data.usuario_id)
          if (selectedUser) {
            await studentsApi.assignUser(student.ci, selectedUser.id)
          }
        } else if (!data.usuario_id && currentUserId) {
          // Desasignar usuario si se removió la selección
          await studentsApi.unassignUser(student.ci)
        }
      } else {
        // Crear estudiante
        const newStudent = await studentsApi.create(data)
        const rolesResponse = await rolesApi.getAll()
        const estudianteGroup = rolesResponse.results.find(
          group => group.name.toLowerCase() === "estudiante"
        )

        if (!estudianteGroup) {
          throw new Error("No se encontró el grupo 'Estudiante'")
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
              password: `EST.${data.ci}`,
              password_confirm: `EST.${data.ci}`,
              groups: [estudianteGroup.id], // ✅ Asigna automáticamente el grupo Estudiante
            }

            const newUser = await authApi.register(userData)
            await studentsApi.assignUser(data.ci, newUser.id)
          } catch (userError) {
            console.error("Error creating user:", userError)
          }
        } else if (data.usuario_id) {
          // Asignar usuario existente
          const selectedUser = availableUsers.find((u) => u.username === data.usuario_id)
          if (selectedUser) {
            await studentsApi.assignUser(data.ci, selectedUser.id)
          }
        }
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving student:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Estudiante" : "Agregar Estudiante"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del estudiante"
              : "Completa la información para agregar un nuevo estudiante."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci">CI</Label>
              <Input id="ci" {...register("ci")} disabled={mode === "edit"} placeholder="Ej: 12345678" />
              {errors.ci && <p className="text-sm text-destructive">{errors.ci.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="estudiante@ejemplo.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Juan" />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" {...register("apellido")} placeholder="Pérez" />
              {errors.apellido && <p className="text-sm text-destructive">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} />
              {errors.fecha_nacimiento && <p className="text-sm text-destructive">{errors.fecha_nacimiento.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_curso">Curso</Label>
              <Select value={selectedCourse} onValueChange={(value) => setValue("codigo_curso", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.codigo} value={course.codigo}>
                      {course.nombre} - {course.nivel} {course.paralelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.codigo_curso && <p className="text-sm text-destructive">{errors.codigo_curso.message}</p>}
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
                      <strong>Contraseña:</strong> EST.{watch("ci") || "[CI]"}
                    </p>
                    <p className="text-xs mt-1">
                      El estudiante podrá cambiar su contraseña después del primer inicio de sesión.
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
