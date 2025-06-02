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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { tutorsApi, studentsApi } from "@/lib/api"
import { X, Plus, Users } from "lucide-react"
import type { Tutor, Student } from "@/types/api"

const tutorSchema = z.object({
  ci: z.string().min(6, "La CI debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
})

type TutorFormData = z.infer<typeof tutorSchema>

interface StudentAssignment {
  ci_estudiante: string
  nombre_completo: string
  parentesco: string
}

interface TutorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutor: Tutor | null
  mode: "create" | "edit"
  onSuccess: () => void
}

const PARENTESCO_OPTIONS = [
  { value: "PADRE", label: "Padre" },
  { value: "MADRE", label: "Madre" },
  { value: "TUTOR_LEGAL", label: "Tutor Legal" },
  { value: "ABUELO", label: "Abuelo" },
  { value: "ABUELA", label: "Abuela" },
  { value: "TIO", label: "Tío" },
  { value: "TIA", label: "Tía" },
  { value: "HERMANO", label: "Hermano" },
  { value: "HERMANA", label: "Hermana" },
  { value: "OTRO", label: "Otro" },
]

export function TutorForm({ open, onOpenChange, tutor, mode, onSuccess }: TutorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([])
  const [newAssignment, setNewAssignment] = useState({
    ci_estudiante: "",
    parentesco: "",
  })
  const [originalAssignments, setOriginalAssignments] = useState<StudentAssignment[]>([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
  })

  // Cargar estudiantes disponibles
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await studentsApi.getAll()
        setStudents(response.results)
      } catch (error) {
        console.error("Error loading students:", error)
      }
    }

    if (open) {
      loadStudents()
    }
  }, [open])

  // Cargar datos del tutor en modo edición
  useEffect(() => {
    if (tutor && mode === "edit") {
      reset({
        ci: tutor.ci,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        telefono: tutor.telefono,
        email: tutor.email,
      })

      // Cargar estudiantes asignados
      if (tutor.estudiantes_asignados) {
        const assignments = tutor.estudiantes_asignados.map((est) => ({
          ci_estudiante: est.ci,
          nombre_completo: est.nombre_completo,
          parentesco: est.parentesco,
        }))
        setStudentAssignments(assignments)
        setOriginalAssignments(assignments) // Guardar estado original
      }
    } else {
      reset({
        ci: "",
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
      })
      setStudentAssignments([])
      setOriginalAssignments([])
    }
  }, [tutor, mode, reset])

  const addStudentAssignment = () => {
    if (!newAssignment.ci_estudiante || !newAssignment.parentesco) return

    const student = students.find((s) => s.ci === newAssignment.ci_estudiante)
    if (!student) return

    // Verificar que no esté ya asignado
    if (studentAssignments.some((a) => a.ci_estudiante === newAssignment.ci_estudiante)) {
      return
    }

    const assignment: StudentAssignment = {
      ci_estudiante: student.ci,
      nombre_completo: `${student.nombre} ${student.apellido}`,
      parentesco: newAssignment.parentesco,
    }

    setStudentAssignments([...studentAssignments, assignment])
    setNewAssignment({ ci_estudiante: "", parentesco: "" })
  }

  const removeStudentAssignment = (ci_estudiante: string) => {
    setStudentAssignments(studentAssignments.filter((a) => a.ci_estudiante !== ci_estudiante))
  }

  const onSubmit = async (data: TutorFormData) => {
    setIsLoading(true)
    try {
      let tutorResult: Tutor

      if (mode === "edit" && tutor) {
        tutorResult = await tutorsApi.update(tutor.ci, data)

        // En modo edición, manejar asignaciones y desasignaciones
        const originalAssignments = tutor.estudiantes_asignados || []
        const currentAssignments = studentAssignments

        // Encontrar estudiantes que fueron removidos (estaban antes pero ya no están)
        const studentsToUnassign = originalAssignments.filter(
          (original) => !currentAssignments.some((current) => current.ci_estudiante === original.ci)
        )

        // Encontrar estudiantes que fueron agregados (están ahora pero no estaban antes)
        const studentsToAssign = currentAssignments.filter(
          (current) => !originalAssignments.some((original) => original.ci === current.ci_estudiante)
        )

        // Desasignar estudiantes removidos
        for (const student of studentsToUnassign) {
          try {
            await tutorsApi.unassignStudent(tutorResult.ci, {
              ci_estudiante: student.ci,
            })
          } catch (error) {
            console.error("Error unassigning student:", error)
          }
        }

        // Asignar estudiantes nuevos
        for (const assignment of studentsToAssign) {
          try {
            await tutorsApi.assignStudent(tutorResult.ci, {
              ci_estudiante: assignment.ci_estudiante,
              parentesco: assignment.parentesco,
            })
          } catch (error) {
            console.error("Error assigning student:", error)
          }
        }
      } else {
        // Modo creación
        tutorResult = await tutorsApi.create(data)

        // Asignar todos los estudiantes
        for (const assignment of studentAssignments) {
          try {
            await tutorsApi.assignStudent(tutorResult.ci, {
              ci_estudiante: assignment.ci_estudiante,
              parentesco: assignment.parentesco,
            })
          } catch (error) {
            console.error("Error assigning student:", error)
          }
        }
      }

      onSuccess()
      reset()
      setStudentAssignments([])
    } catch (error) {
      console.error("Error saving tutor:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const availableStudents = students.filter(
    (student) => !studentAssignments.some((a) => a.ci_estudiante === student.ci),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Tutor" : "Agregar Tutor"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del tutor y gestiona sus estudiantes asignados"
              : "Completa la información para agregar un nuevo tutor y asignar estudiantes"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Tutor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ci">CI</Label>
                <Input id="ci" {...register("ci")} disabled={mode === "edit"} error={errors.ci?.message} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" {...register("nombre")} error={errors.nombre?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" {...register("apellido")} error={errors.apellido?.message} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" {...register("telefono")} error={errors.telefono?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Estudiantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Estudiantes Asignados
              </CardTitle>
              <CardDescription>Asigna estudiantes a este tutor especificando el parentesco</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agregar nuevo estudiante */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="student-select">Estudiante</Label>
                  <Select
                    value={newAssignment.ci_estudiante}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, ci_estudiante: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.ci} value={student.ci}>
                          {student.nombre} {student.apellido} - {student.ci}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor="parentesco-select">Parentesco</Label>
                  <Select
                    value={newAssignment.parentesco}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, parentesco: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARENTESCO_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  onClick={addStudentAssignment}
                  disabled={!newAssignment.ci_estudiante || !newAssignment.parentesco}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Lista de estudiantes asignados */}
              <div className="space-y-2">
                {studentAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes asignados</p>
                ) : (
                  studentAssignments.map((assignment) => (
                    <div
                      key={assignment.ci_estudiante}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{assignment.nombre_completo}</p>
                          <p className="text-sm text-muted-foreground">CI: {assignment.ci_estudiante}</p>
                        </div>
                        <Badge variant="secondary">
                          {PARENTESCO_OPTIONS.find((p) => p.value === assignment.parentesco)?.label}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudentAssignment(assignment.ci_estudiante)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
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
