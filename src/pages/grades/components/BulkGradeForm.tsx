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
import { Trash2, Plus } from "lucide-react"
import { gradesApi, coursesApi, subjectsApi } from "@/lib/api"
import type { Course, Subject, Student } from "@/types/api"

const bulkGradeSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  codigo_criterio: z.string().min(1, "El criterio es requerido"),
  notas: z
    .array(
      z.object({
        ci_estudiante: z.string().min(1, "El estudiante es requerido"),
        nota: z.number().min(0).max(100),
        observaciones: z.string().optional(),
      }),
    )
    .min(1, "Debe agregar al menos una calificación"),
})

type BulkGradeFormData = z.infer<typeof bulkGradeSchema>

interface BulkGradeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkGradeForm({ open, onOpenChange, onSuccess }: BulkGradeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[] | []>([])
  const [subjects, setSubjects] = useState<Subject[] | []>([])
  const [students, setStudents] = useState<Student[] | []>([])
  const [criteria, setCriteria] = useState<any[] | []>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkGradeFormData>({
    resolver: zodResolver(bulkGradeSchema),
    defaultValues: {
      notas: [{ ci_estudiante: "", nota: 0, observaciones: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "notas",
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

  const fetchInitialData = async () => {
    try {
      const [coursesResponse, subjectsResponse, criteriaResponse] = await Promise.all([
        coursesApi.getAll(),
        subjectsApi.getAll(),
        coursesApi.getCriteria(),
      ])
      setCourses(coursesResponse.results || [])
      setSubjects(subjectsResponse.results || [])
      setCriteria(criteriaResponse || [])
    } catch (error) {
      console.error("Error fetching initial data:", error)
      // Establecer arrays vacíos en caso de error
      setCourses([])
      setSubjects([])
      setCriteria([])
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

  const addAllStudents = () => {
    if (!students || students.length === 0) return

    const newGrades = students.map((student) => ({
      ci_estudiante: student.ci,
      nota: 0,
      observaciones: "",
    }))
    setValue("notas", newGrades)
  }

  const onSubmit = async (data: BulkGradeFormData) => {
    setIsLoading(true)
    try {
      const notasData = data.notas.map((nota) => ({
        codigo_curso: data.codigo_curso,
        codigo_materia: data.codigo_materia,
        codigo_criterio: data.codigo_criterio,
        ci_estudiante: nota.ci_estudiante,
        nota: nota.nota,
        observaciones: nota.observaciones,
      }))

      await gradesApi.createBulk({ notas: notasData })
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving bulk grades:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registro Masivo de Calificaciones</DialogTitle>
          <DialogDescription>Registra calificaciones para múltiples estudiantes de una vez</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select value={watch("codigo_curso")} onValueChange={(value) => setValue("codigo_curso", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {(courses || []).map((course) => (
                        <SelectItem key={course.codigo} value={course.codigo}>
                          {course.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_curso && <p className="text-sm text-destructive">{errors.codigo_curso.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Materia</Label>
                  <Select value={watch("codigo_materia")} onValueChange={(value) => setValue("codigo_materia", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {(subjects || []).map((subject) => (
                        <SelectItem key={subject.codigo} value={subject.codigo}>
                          {subject.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_materia && <p className="text-sm text-destructive">{errors.codigo_materia.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Criterio</Label>
                  <Select
                    value={watch("codigo_criterio")}
                    onValueChange={(value) => setValue("codigo_criterio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar criterio" />
                    </SelectTrigger>
                    <SelectContent>
                      {(criteria || []).map((criterio) => (
                        <SelectItem key={criterio.codigo} value={criterio.codigo}>
                          {criterio.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_criterio && (
                    <p className="text-sm text-destructive">{errors.codigo_criterio.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calificaciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Calificaciones
                  <Badge variant="outline" className="ml-2">
                    {fields.length} estudiantes
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  {selectedCourse && (
                    <Button type="button" variant="outline" size="sm" onClick={addAllStudents}>
                      Agregar Todos los Estudiantes
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ci_estudiante: "", nota: 0, observaciones: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 md:grid-cols-12 items-end border rounded-lg p-4">
                  <div className="md:col-span-4 space-y-2">
                    <Label>Estudiante</Label>
                    <Select
                      value={watch(`notas.${index}.ci_estudiante`)}
                      onValueChange={(value) => setValue(`notas.${index}.ci_estudiante`, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estudiante" />
                      </SelectTrigger>
                      <SelectContent>
                        {(students || []).map((student) => (
                          <SelectItem key={student.ci} value={student.ci}>
                            {student.nombre} {student.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Nota</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...register(`notas.${index}.nota`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="md:col-span-5 space-y-2">
                    <Label>Observaciones</Label>
                    <Input {...register(`notas.${index}.observaciones`)} placeholder="Observaciones (opcional)" />
                  </div>

                  <div className="md:col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Calificaciones"}
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
