"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { attendanceApi, coursesApi, subjectsApi } from "@/lib/api"
import type { Attendance, Course, Subject, Student } from "@/types/api"

const attendanceSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  ci_estudiante: z.string().min(1, "El estudiante es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  asistio: z.boolean(),
  observacion: z.string().optional(),
})

type AttendanceFormData = z.infer<typeof attendanceSchema>

interface AttendanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function AttendanceForm({ open, onOpenChange, attendance, mode, onSuccess }: AttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  })

  const selectedCourse = watch("codigo_curso")

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsByCourse(selectedCourse)
    }
  }, [selectedCourse])

  useEffect(() => {
    if (attendance && mode === "edit") {
      reset({
        codigo_curso: attendance.codigo_curso,
        codigo_materia: attendance.codigo_materia,
        ci_estudiante: attendance.ci_estudiante,
        fecha: attendance.fecha,
        asistio: attendance.asistio,
        observacion: attendance.observacion || "",
      })
    } else {
      reset({
        codigo_curso: "",
        codigo_materia: "",
        ci_estudiante: "",
        fecha: new Date().toISOString().split("T")[0],
        asistio: true,
        observacion: "",
      })
    }
  }, [attendance, mode, reset])

  const fetchInitialData = async () => {
    try {
      const [coursesResponse, subjectsResponse] = await Promise.all([coursesApi.getAll(), subjectsApi.getAll()])
      setCourses(coursesResponse.results)
      setSubjects(subjectsResponse.results)
    } catch (error) {
      console.error("Error fetching initial data:", error)
    }
  }

  const fetchStudentsByCourse = async (courseCode: string) => {
    try {
      const response = await coursesApi.getStudents(courseCode)
      setStudents(response)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const onSubmit = async (data: AttendanceFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && attendance) {
        await attendanceApi.update(attendance.id, data)
      } else {
        await attendanceApi.create(data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Asistencia" : "Registrar Asistencia"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica el registro de asistencia"
              : "Completa la información para registrar la asistencia"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigo_curso">Curso</Label>
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
              <Label htmlFor="codigo_materia">Materia</Label>
              <Select value={watch("codigo_materia")} onValueChange={(value) => setValue("codigo_materia", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.codigo} value={subject.codigo}>
                      {subject.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.codigo_materia && <p className="text-sm text-destructive">{errors.codigo_materia.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" {...register("fecha")} />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asistio">Estado de Asistencia</Label>
              <Select
                value={watch("asistio") ? "true" : "false"}
                onValueChange={(value) => setValue("asistio", value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Presente</SelectItem>
                  <SelectItem value="false">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ci_estudiante">Estudiante</Label>
            <Select
              value={watch("ci_estudiante")}
              onValueChange={(value) => setValue("ci_estudiante", value)}
              disabled={!selectedCourse}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.ci} value={student.ci}>
                    {student.nombre_completo} - CI: {student.ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ci_estudiante && <p className="text-sm text-destructive">{errors.ci_estudiante.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observaciones</Label>
            <Textarea
              id="observacion"
              {...register("observacion")}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Registrar"}
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
