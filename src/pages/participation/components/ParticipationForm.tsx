"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { participationApi, coursesApi, subjectsApi } from "@/lib/api"
import type { Participation, Course, Subject, Student } from "@/types/api"

const participationSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  ci_estudiante: z.string().min(1, "El estudiante es requerido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  tipo_participacion: z.string().min(1, "El tipo de participación es requerido"),
  calificacion: z.number().min(1, "La calificación mínima es 1").max(5, "La calificación máxima es 5"),
  observacion: z.string().optional(),
})

type ParticipationFormData = z.infer<typeof participationSchema>

interface ParticipationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participation?: Participation | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function ParticipationForm({ open, onOpenChange, participation, mode, onSuccess }: ParticipationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ParticipationFormData>({
    resolver: zodResolver(participationSchema),
  })

  const watchedCourse = watch("codigo_curso")

  useEffect(() => {
    if (open) {
      fetchCourses()
      fetchSubjects()
      if (participation && mode === "edit") {
        setValue("codigo_curso", participation.codigo_curso)
        setValue("codigo_materia", participation.codigo_materia)
        setValue("ci_estudiante", participation.ci_estudiante)
        setValue("fecha", participation.fecha)
        setValue("tipo_participacion", participation.tipo_participacion)
        setValue("calificacion", participation.calificacion)
        setValue("observacion", participation.observacion || "")
        setSelectedCourse(participation.codigo_curso)
      }
    }
  }, [open, participation, mode, setValue])

  useEffect(() => {
    if (watchedCourse) {
      setSelectedCourse(watchedCourse)
      fetchStudentsByCourse(watchedCourse)
    }
  }, [watchedCourse])

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll()
      setCourses(response.results)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll()
      setSubjects(response.results)
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchStudentsByCourse = async (courseCode: string) => {
    try {
      const courseStudents = await coursesApi.getStudents(courseCode)
      setStudents(courseStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const onSubmit = async (data: ParticipationFormData) => {
    setIsLoading(true)
    try {
      if (mode === "create") {
        await participationApi.create(data)
      } else if (participation) {
        await participationApi.update(participation.id, data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving participation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const participationTypes = [
    "PREGUNTA",
    "RESPUESTA",
    "EXPOSICION",
    "DEBATE",
    "TRABAJO_EQUIPO",
    "PRESENTACION",
    "INTERVENCION_VOLUNTARIA",
    "LIDERAZGO",
    "COLABORACION",
    "INICIATIVA",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Registrar Participación" : "Editar Participación"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo_curso">Curso</Label>
              <Select onValueChange={(value) => setValue("codigo_curso", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="codigo_materia">Materia</Label>
              <Select onValueChange={(value) => setValue("codigo_materia", value)}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ci_estudiante">Estudiante</Label>
              <Select onValueChange={(value) => setValue("ci_estudiante", value)}>
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
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" {...register("fecha")} max={new Date().toISOString().split("T")[0]} />
              {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_participacion">Tipo de Participación</Label>
              <Select onValueChange={(value) => setValue("tipo_participacion", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {participationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_participacion && (
                <p className="text-sm text-destructive">{errors.tipo_participacion.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calificacion">Calificación (1-5)</Label>
              <Input
                id="calificacion"
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...register("calificacion", { valueAsNumber: true })}
              />
              {errors.calificacion && <p className="text-sm text-destructive">{errors.calificacion.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacion">Observaciones</Label>
            <Textarea
              id="observacion"
              placeholder="Observaciones adicionales sobre la participación..."
              {...register("observacion")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mode === "create" ? "Registrar" : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
