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
import { gradesApi, coursesApi, subjectsApi } from "@/lib/api"
import type { Grade, Course, Subject, Student } from "@/types/api"

const gradeSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  ci_estudiante: z.string().min(1, "El estudiante es requerido"),
  codigo_criterio: z.string().min(1, "El criterio es requerido"),
  nota: z.number().min(0, "La nota debe ser mayor o igual a 0").max(100, "La nota debe ser menor o igual a 100"),
  observaciones: z.string().optional(),
})

type GradeFormData = z.infer<typeof gradeSchema>

interface GradeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grade: Grade | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function GradeForm({ open, onOpenChange, grade, mode, onSuccess }: GradeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [criteria, setCriteria] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
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
    if (grade && mode === "edit") {
      reset({
        codigo_curso: grade.codigo_curso,
        codigo_materia: grade.codigo_materia,
        ci_estudiante: grade.ci_estudiante,
        codigo_criterio: grade.codigo_criterio,
        nota: grade.nota,
        observaciones: grade.observaciones || "",
      })
    } else {
      reset({
        codigo_curso: "",
        codigo_materia: "",
        ci_estudiante: "",
        codigo_criterio: "",
        nota: 0,
        observaciones: "",
      })
    }
  }, [grade, mode, reset])

  const fetchInitialData = async () => {
    try {
      const [coursesResponse, subjectsResponse, criteriaResponse] = await Promise.all([
        coursesApi.getAll(),
        subjectsApi.getAll(),
        coursesApi.getCriteria(),
      ])
      setCourses(coursesResponse.results)
      setSubjects(subjectsResponse.results)
      setCriteria(criteriaResponse)
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

  const onSubmit = async (data: GradeFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && grade) {
        await gradesApi.update(grade.id, data)
      } else {
        await gradesApi.create(data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving grade:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Calificación" : "Agregar Calificación"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información de la calificación"
              : "Completa la información para agregar una nueva calificación"}
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
              <Label htmlFor="codigo_criterio">Criterio de Evaluación</Label>
              <Select value={watch("codigo_criterio")} onValueChange={(value) => setValue("codigo_criterio", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar criterio" />
                </SelectTrigger>
                <SelectContent>
                  {criteria.map((criterio) => (
                    <SelectItem key={criterio.codigo} value={criterio.codigo}>
                      {criterio.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.codigo_criterio && <p className="text-sm text-destructive">{errors.codigo_criterio.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota">Calificación (0-100)</Label>
            <Input
              id="nota"
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register("nota", { valueAsNumber: true })}
            />
            {errors.nota && <p className="text-sm text-destructive">{errors.nota.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...register("observaciones")}
              placeholder="Observaciones adicionales (opcional)"
              rows={3}
            />
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
