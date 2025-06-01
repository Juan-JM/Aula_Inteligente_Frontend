"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { attendanceApi, coursesApi } from "@/lib/api"
import type { Course, Student } from "@/types/api"

const bulkAttendanceSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  asistencias: z
    .array(
      z.object({
        ci_estudiante: z.string().min(1, "El estudiante es requerido"),
        estado: z.enum(["presente", "ausente", "tardanza", "justificado"]),
        hora_llegada: z.string().optional(),
        observaciones: z.string().optional(),
      }),
    )
    .min(1, "Debe agregar al menos un registro"),
})

type BulkAttendanceFormData = z.infer<typeof bulkAttendanceSchema>

interface BulkAttendanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkAttendanceForm({ open, onOpenChange, onSuccess }: BulkAttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkAttendanceFormData>({
    resolver: zodResolver(bulkAttendanceSchema),
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      asistencias: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "asistencias",
  })

  const selectedCourse = watch("codigo_curso")

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsByCourse(selectedCourse)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchStudentsByCourse = async (courseCode: string) => {
    try {
      const response = await coursesApi.getStudents(courseCode)
      setStudents(response)

      // Crear registros para todos los estudiantes
      const newAttendances = response.map((student) => ({
        ci_estudiante: student.ci,
        estado: "presente" as const,
        hora_llegada: "",
        observaciones: "",
      }))
      replace(newAttendances)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const markAllAs = (estado: "presente" | "ausente") => {
    const updatedAttendances = fields.map((field, index) => ({
      ...field,
      estado,
    }))
    replace(updatedAttendances)
  }

  const onSubmit = async (data: BulkAttendanceFormData) => {
    setIsLoading(true)
    try {
      const attendanceData = data.asistencias.map((asistencia) => ({
        codigo_curso: data.codigo_curso,
        fecha: data.fecha,
        ci_estudiante: asistencia.ci_estudiante,
        estado: asistencia.estado,
        hora_llegada: asistencia.hora_llegada,
        observaciones: asistencia.observaciones,
      }))

      await attendanceApi.createBulk({ asistencias: attendanceData })
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving bulk attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStudentName = (ci: string) => {
    const student = students.find((s) => s.ci === ci)
    return student ? `${student.nombre} ${student.apellido}` : ci
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registro Masivo de Asistencia</DialogTitle>
          <DialogDescription>Registra la asistencia para todos los estudiantes de un curso</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select value={watch("codigo_curso")} onValueChange={(value) => setValue("codigo_curso", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.codigo} value={course.codigo}>
                          {course.nombre} - {course.nivel} "{course.paralelo}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_curso && <p className="text-sm text-destructive">{errors.codigo_curso.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" {...register("fecha")} error={errors.fecha?.message} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Asistencia */}
          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Lista de Asistencia
                    <Badge variant="outline" className="ml-2">
                      {fields.length} estudiantes
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("presente")}>
                      Marcar Todos Presentes
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => markAllAs("ausente")}>
                      Marcar Todos Ausentes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 md:grid-cols-12 items-center border rounded-lg p-3">
                    <div className="md:col-span-4">
                      <span className="font-medium">{getStudentName(field.ci_estudiante)}</span>
                      <div className="text-sm text-muted-foreground">CI: {field.ci_estudiante}</div>
                    </div>

                    <div className="md:col-span-2">
                      <Select
                        value={watch(`asistencias.${index}.estado`)}
                        onValueChange={(value) => setValue(`asistencias.${index}.estado`, value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presente">Presente</SelectItem>
                          <SelectItem value="ausente">Ausente</SelectItem>
                          <SelectItem value="tardanza">Tardanza</SelectItem>
                          <SelectItem value="justificado">Justificado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        type="time"
                        {...register(`asistencias.${index}.hora_llegada`)}
                        placeholder="Hora"
                        disabled={
                          watch(`asistencias.${index}.estado`) === "ausente" ||
                          watch(`asistencias.${index}.estado`) === "justificado"
                        }
                      />
                    </div>

                    <div className="md:col-span-4">
                      <Input
                        {...register(`asistencias.${index}.observaciones`)}
                        placeholder="Observaciones (opcional)"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || fields.length === 0}>
              {isLoading ? "Guardando..." : "Guardar Asistencia"}
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
