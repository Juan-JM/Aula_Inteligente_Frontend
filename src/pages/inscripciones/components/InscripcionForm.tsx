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
import { Textarea } from "@/components/ui/textarea"
import { inscripcionesApi, studentsApi, coursesApi } from "@/lib/api"
import type { Inscripcion, Student, Course } from "@/types/api"

const inscripcionSchema = z.object({
  ci_estudiante: z.string().min(1, "El estudiante es requerido"),
  codigo_curso: z.string().min(1, "El curso es requerido"),
  fecha_inscripcion: z.string().min(1, "La fecha de inscripción es requerida"),
  estado: z.enum(["ACTIVO", "RETIRADO", "TRASLADADO"]).optional(),
  fecha_baja: z.string().optional(),
  motivo_baja: z.string().optional(),
})

type InscripcionFormData = z.infer<typeof inscripcionSchema>

interface InscripcionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inscripcion: Inscripcion | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function InscripcionForm({ open, onOpenChange, inscripcion, mode, onSuccess }: InscripcionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InscripcionFormData>({
    resolver: zodResolver(inscripcionSchema),
  })

  const selectedStudent = watch("ci_estudiante")
  const selectedCourse = watch("codigo_curso")
  const selectedEstado = watch("estado")

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  useEffect(() => {
    if (inscripcion && mode === "edit") {
      reset({
        ci_estudiante: inscripcion.ci_estudiante,
        codigo_curso: inscripcion.codigo_curso,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        estado: inscripcion.estado,
        fecha_baja: inscripcion.fecha_baja || "",
        motivo_baja: inscripcion.motivo_baja || "",
      })
    } else {
      reset({
        ci_estudiante: "",
        codigo_curso: "",
        fecha_inscripcion: new Date().toISOString().split("T")[0],
        estado: "ACTIVO",
        fecha_baja: "",
        motivo_baja: "",
      })
    }
  }, [inscripcion, mode, reset])

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([studentsApi.getAll(), coursesApi.getAll()])

      setStudents(studentsRes.results)
      setCourses(coursesRes.results)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const onSubmit = async (data: InscripcionFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && inscripcion) {
        await inscripcionesApi.update(inscripcion.id, data)
      } else {
        await inscripcionesApi.create(data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving inscripcion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Inscripción" : "Nueva Inscripción"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información de la inscripción"
              : "Inscribe un estudiante a un curso específico"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ci_estudiante">Estudiante</Label>
              <Select
                value={selectedStudent}
                onValueChange={(value) => setValue("ci_estudiante", value)}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.ci} value={student.ci}>
                      {student.nombre} {student.apellido} - {student.ci}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ci_estudiante && <p className="text-sm text-destructive">{errors.ci_estudiante.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo_curso">Curso</Label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => setValue("codigo_curso", value)}
                disabled={mode === "edit"}
              >
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha_inscripcion">Fecha de Inscripción</Label>
              <Input id="fecha_inscripcion" type="date" {...register("fecha_inscripcion")} />
              {errors.fecha_inscripcion && (
                <p className="text-sm text-destructive">{errors.fecha_inscripcion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={selectedEstado} onValueChange={(value) => setValue("estado", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="RETIRADO">Retirado</SelectItem>
                  <SelectItem value="TRASLADADO">Trasladado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEstado && selectedEstado !== "ACTIVO" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fecha_baja">Fecha de Baja</Label>
                <Input id="fecha_baja" type="date" {...register("fecha_baja")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo_baja">Motivo de Baja</Label>
                <Textarea
                  id="motivo_baja"
                  {...register("motivo_baja")}
                  placeholder="Describe el motivo de la baja..."
                />
              </div>
            </>
          )}

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
