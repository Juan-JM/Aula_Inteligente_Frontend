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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { participationApi, coursesApi, subjectsApi } from "@/lib/api"
import type { Course, Subject, Student } from "@/types/api"

const bulkParticipationSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  fecha: z.string().min(1, "La fecha es requerida"),
  tipo_participacion: z.string().min(1, "El tipo de participación es requerido"),
  calificacion: z.number().min(0, "La calificación mínima es 0").max(5, "La calificación máxima es 5"),
  observaciones: z.string().optional(),
  estudiantes: z.array(z.string()).min(1, "Debe seleccionar al menos un estudiante"),
})

type BulkParticipationFormData = z.infer<typeof bulkParticipationSchema>

interface BulkParticipationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkParticipationForm({ open, onOpenChange, onSuccess }: BulkParticipationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkParticipationFormData>({
    resolver: zodResolver(bulkParticipationSchema),
  })

  const watchedCourse = watch("codigo_curso")

  useEffect(() => {
    if (open) {
      fetchCourses()
      fetchSubjects()
    }
  }, [open])

  useEffect(() => {
    if (watchedCourse) {
      fetchStudentsByCourse(watchedCourse)
      setSelectedStudents([])
    }
  }, [watchedCourse])

  useEffect(() => {
    setValue("estudiantes", selectedStudents)
  }, [selectedStudents, setValue])

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

  const handleStudentToggle = (studentCi: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentCi) ? prev.filter((ci) => ci !== studentCi) : [...prev, studentCi],
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map((student) => student.ci))
    }
  }

  const onSubmit = async (data: BulkParticipationFormData) => {
    setIsLoading(true)
    try {
      const participationData = {
        codigo_curso: data.codigo_curso,
        codigo_materia: data.codigo_materia,
        fecha: data.fecha,
        tipo_participacion: data.tipo_participacion,
        calificacion: data.calificacion,
        observaciones: data.observaciones,
        estudiantes: selectedStudents,
      }

      await participationApi.createBulk(participationData)
      onSuccess()
      reset()
      setSelectedStudents([])
    } catch (error) {
      console.error("Error saving bulk participation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const participationTypes = [
    "Participación en clase",
    "Pregunta respondida",
    "Exposición",
    "Debate",
    "Trabajo en equipo",
    "Presentación",
    "Intervención voluntaria",
    "Liderazgo",
    "Colaboración",
    "Iniciativa",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registro Masivo de Participación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input id="fecha" type="date" {...register("fecha")} max={new Date().toISOString().split("T")[0]} />
                  {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_participacion">Tipo de Participación</Label>
                  <Select onValueChange={(value) => setValue("tipo_participacion", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {participationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_participacion && (
                    <p className="text-sm text-destructive">{errors.tipo_participacion.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calificacion">Calificación (0-5)</Label>
                  <Input
                    id="calificacion"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...register("calificacion", { valueAsNumber: true })}
                  />
                  {errors.calificacion && <p className="text-sm text-destructive">{errors.calificacion.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones generales para todos los estudiantes..."
                  {...register("observaciones")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selección de estudiantes */}
          {students.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Seleccionar Estudiantes
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedStudents.length} de {students.length} seleccionados
                    </Badge>
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedStudents.length === students.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.ci}
                      className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        id={student.ci}
                        checked={selectedStudents.includes(student.ci)}
                        onCheckedChange={() => handleStudentToggle(student.ci)}
                      />
                      <label htmlFor={student.ci} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm">
                          {student.nombre} {student.apellido}
                        </div>
                        <div className="text-xs text-muted-foreground">CI: {student.ci}</div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.estudiantes && <p className="text-sm text-destructive mt-2">{errors.estudiantes.message}</p>}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || selectedStudents.length === 0}>
              {isLoading ? "Registrando..." : `Registrar Participación (${selectedStudents.length})`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
