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
import { gradesApi, coursesApi, subjectsApi, camposApi, periodosApi, criteriosApi } from "@/lib/api"
import type { Course, Subject, Student, Campo, Periodo } from "@/types/api"

// Actualizado: Esquema ahora incluye campos para crear criterio
const bulkGradeSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  // Campos para crear criterio
  criterio_descripcion: z.string().min(1, "La descripción del criterio es requerida"),
  codigo_campo: z.string().min(1, "El campo es requerido"),
  codigo_periodo: z.string().min(1, "El periodo es requerido"),
  // Notas
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
  const [campos, setCampos] = useState<Campo[] | []>([])
  const [periodos, setPeriodos] = useState<Periodo[] | []>([])

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

  // Función helper para obtener el nombre del estudiante por CI
  const getStudentDisplayName = (ci: string) => {
    if (!ci) return "Seleccionar estudiante"
    
    const student = students.find(s => s.ci === ci)
    if (!student) return `CI: ${ci}`
    
    const nombre = student.nombre || 'Sin nombre'
    const apellido = student.apellido || 'Sin apellido'
    return `${nombre} ${apellido} - CI: ${ci}`
  }

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
      const [coursesResponse, subjectsResponse, camposResponse, periodosResponse] = await Promise.all([
        coursesApi.getAll(),
        subjectsApi.getAll(),
        camposApi.getAll(),
        periodosApi.getAll(),
      ])
      setCourses(coursesResponse.results || [])
      setSubjects(subjectsResponse.results || [])
      setCampos(camposResponse.results || [])
      setPeriodos(periodosResponse.results || [])
    } catch (error) {
      console.error("Error fetching initial data:", error)
      // Establecer arrays vacíos en caso de error
      setCourses([])
      setSubjects([])
      setCampos([])
      setPeriodos([])
    }
  }

  const fetchStudentsByCourse = async (courseCode: string) => {
    try {
      const response = await coursesApi.getStudents(courseCode)
      console.log("Students fetched:", response) // Para debug
      setStudents(response || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
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
      // Primero crear el criterio
      const criterioData = {
        descripcion: data.criterio_descripcion,
        codigo_campo: data.codigo_campo,
        codigo_periodo: data.codigo_periodo,
      }

      // Crear el criterio
      const newCriterio = await criteriosApi.create(criterioData)

      // Luego crear las calificaciones
      const notasData = data.notas.map((nota) => ({
        codigo_curso: data.codigo_curso,
        codigo_materia: data.codigo_materia,
        id_criterio: newCriterio.id, // Usar el ID del criterio creado
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <Select value={watch("codigo_curso")} onValueChange={(value) => setValue("codigo_curso", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {(courses || []).map((course) => (
                        <SelectItem key={course.codigo} value={course.codigo}>
                          {course.nombre} - {course.nivel} "{course.paralelo}"
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
              </div>
            </CardContent>
          </Card>

          {/* Nueva sección para crear criterio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criterio de Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="criterio_descripcion">Descripción</Label>
                <Input
                  id="criterio_descripcion"
                  {...register("criterio_descripcion")}
                  placeholder="Ej: Examen Primer Trimestre 2024"
                />
                {errors.criterio_descripcion && (
                  <p className="text-sm text-destructive">{errors.criterio_descripcion.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codigo_campo">Campo</Label>
                  <Select value={watch("codigo_campo")} onValueChange={(value) => setValue("codigo_campo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(campos || []).map((campo) => (
                        <SelectItem key={campo.codigo} value={campo.codigo}>
                          {campo.nombre} ({campo.valor}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_campo && <p className="text-sm text-destructive">{errors.codigo_campo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_periodo">Periodo</Label>
                  <Select value={watch("codigo_periodo")} onValueChange={(value) => setValue("codigo_periodo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {(periodos || []).map((periodo) => (
                        <SelectItem key={periodo.codigo} value={periodo.codigo}>
                          {periodo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.codigo_periodo && <p className="text-sm text-destructive">{errors.codigo_periodo.message}</p>}
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
                        <SelectValue placeholder="Seleccionar estudiante">
                          {watch(`notas.${index}.ci_estudiante`) && (
                            <span className="truncate">
                              {getStudentDisplayName(watch(`notas.${index}.ci_estudiante`))}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(students || []).map((student) => (
                          <SelectItem key={student.ci} value={student.ci}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {student.nombre || 'Sin nombre'} {student.apellido || 'Sin apellido'}
                              </span>
                              <span className="text-sm text-muted-foreground">CI: {student.ci}</span>
                            </div>
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