"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { asignacionesApi, teachersApi, subjectsApi, coursesApi } from "@/lib/api"
import type { Teacher, Subject, Course } from "@/types/api"

const asignacionSchema = z.object({
  ci_docente: z.string().min(1, "El docente es requerido"),
  codigo_materia: z.string().min(1, "La materia es requerida"),
  codigo_curso: z.string().min(1, "El curso es requerido"),
})

type AsignacionFormData = z.infer<typeof asignacionSchema>

interface AsignacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AsignacionForm({ open, onOpenChange, onSuccess }: AsignacionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AsignacionFormData>({
    resolver: zodResolver(asignacionSchema),
  })

  const selectedTeacher = watch("ci_docente")
  const selectedSubject = watch("codigo_materia")
  const selectedCourse = watch("codigo_curso")

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, coursesRes] = await Promise.all([
        teachersApi.getAll(),
        subjectsApi.getAll(),
        coursesApi.getAll(),
      ])

      setTeachers(teachersRes.results)
      setSubjects(subjectsRes.results)
      setCourses(coursesRes.results)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const onSubmit = async (data: AsignacionFormData) => {
    setIsLoading(true)
    try {
      await asignacionesApi.create(data)
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error creating asignacion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Asignación</DialogTitle>
          <DialogDescription>Asigna un docente a una materia en un curso específico</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ci_docente">Docente</Label>
            <Select value={selectedTeacher} onValueChange={(value) => setValue("ci_docente", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar docente" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.ci} value={teacher.ci}>
                    {teacher.nombre} {teacher.apellido} - {teacher.ci}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ci_docente && <p className="text-sm text-destructive">{errors.ci_docente.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_materia">Materia</Label>
            <Select value={selectedSubject} onValueChange={(value) => setValue("codigo_materia", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.codigo} value={subject.codigo}>
                    {subject.nombre} - {subject.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.codigo_materia && <p className="text-sm text-destructive">{errors.codigo_materia.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_curso">Curso</Label>
            <Select value={selectedCourse} onValueChange={(value) => setValue("codigo_curso", value)}>
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Asignación"}
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
