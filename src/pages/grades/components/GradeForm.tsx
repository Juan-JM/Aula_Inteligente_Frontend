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
import { gradesApi, coursesApi, subjectsApi, camposApi, periodosApi, criteriosApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Grade, Course, Subject, Student, Campo, Periodo } from "@/types/api"

// Actualizado: Esquema ahora incluye campos para crear criterio
const gradeSchema = z.object({
  codigo_curso: z.string().min(1, "El curso es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  ci_estudiante: z.string().min(1, "El estudiante es requerido"),
  // Campos para crear criterio
  criterio_descripcion: z.string().min(1, "La descripción del criterio es requerida"),
  codigo_campo: z.string().min(1, "El campo es requerido"),
  codigo_periodo: z.string().min(1, "El periodo es requerido"),
  // Resto de campos
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
  const [campos, setCampos] = useState<Campo[]>([])
  const [periodos, setPeriodos] = useState<Periodo[]>([])

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
      // Para edición, necesitamos obtener los datos del criterio primero
      const fetchCriterioData = async () => {
        try {
          const criterio = await criteriosApi.getById(grade.id_criterio)
          reset({
            codigo_curso: grade.codigo_curso,
            codigo_materia: grade.codigo_materia,
            ci_estudiante: grade.ci_estudiante,
            criterio_descripcion: criterio.descripcion,
            codigo_campo: criterio.codigo_campo,
            codigo_periodo: criterio.codigo_periodo,
            nota: grade.nota,
            observaciones: grade.observaciones || "",
          })
        } catch (error) {
          console.error("Error fetching criterio data:", error)
        }
      }

      fetchCriterioData()
    } else {
      reset({
        codigo_curso: "",
        codigo_materia: "",
        ci_estudiante: "",
        criterio_descripcion: "",
        codigo_campo: "",
        codigo_periodo: "",
        nota: 0,
        observaciones: "",
      })
    }
  }, [grade, mode, reset])

  const fetchInitialData = async () => {
    try {
      const [coursesResponse, subjectsResponse, camposResponse, periodosResponse] = await Promise.all([
        coursesApi.getAll(),
        subjectsApi.getAll(),
        camposApi.getAll(),
        periodosApi.getAll(),
      ])
      setCourses(coursesResponse.results)
      setSubjects(subjectsResponse.results)
      setCampos(camposResponse.results)
      setPeriodos(periodosResponse.results)
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

  // Función helper para obtener el nombre completo del estudiante seleccionado
  const getSelectedStudentDisplayName = () => {
    const selectedCi = watch("ci_estudiante")
    if (!selectedCi) return ""
    
    const student = students.find(s => s.ci === selectedCi)
    if (!student) return `CI: ${selectedCi}`
    
    const nombre = student.nombre || 'Sin nombre'
    const apellido = student.apellido || 'Sin apellido'
    return `${nombre} ${apellido} - CI: ${selectedCi}`
  }

  const onSubmit = async (data: GradeFormData) => {
    setIsLoading(true)
    try {
      // Primero crear el criterio
      const criterioData = {
        descripcion: data.criterio_descripcion,
        codigo_campo: data.codigo_campo,
        codigo_periodo: data.codigo_periodo,
      }

      let criterioId: string

      if (mode === "edit" && grade) {
        // Si estamos editando, actualizamos el criterio existente
        const updatedCriterio = await criteriosApi.update(grade.id_criterio, criterioData)
        criterioId = updatedCriterio.id
      } else {
        // Si estamos creando, creamos un nuevo criterio
        const newCriterio = await criteriosApi.create(criterioData)
        criterioId = newCriterio.id
      }

      // Luego crear o actualizar la calificación
      const gradeData = {
        codigo_curso: data.codigo_curso,
        codigo_materia: data.codigo_materia,
        ci_estudiante: data.ci_estudiante,
        id_criterio: criterioId, // Usar el ID del criterio creado o actualizado
        nota: data.nota,
        observaciones: data.observaciones,
      }

      if (mode === "edit" && grade) {
        await gradesApi.update(grade.id, gradeData)
      } else {
        await gradesApi.create(gradeData)
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
            {errors.ci_estudiante && <p className="text-sm text-destructive">{errors.ci_estudiante.message}</p>}
          </div>

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
                      {campos.map((campo) => (
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
                      {periodos.map((periodo) => (
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