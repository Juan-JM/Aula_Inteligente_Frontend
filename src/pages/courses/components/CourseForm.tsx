"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { coursesApi } from "@/lib/api"
import type { Course } from "@/types/api"

const courseSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  nivel: z.string().min(1, "El nivel es requerido"),
  paralelo: z.string().min(1, "El paralelo es requerido"),
  gestion: z.number().min(2000, "La gestión debe ser válida"),
})

type CourseFormData = z.infer<typeof courseSchema>

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function CourseForm({ open, onOpenChange, course, mode, onSuccess }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  useEffect(() => {
    if (course && mode === "edit") {
      reset({
        codigo: course.codigo,
        nombre: course.nombre,
        nivel: course.nivel,
        paralelo: course.paralelo,
        gestion: course.gestion,
      })
    } else {
      reset({
        codigo: "",
        nombre: "",
        nivel: "",
        paralelo: "",
        gestion: new Date().getFullYear(),
      })
    }
  }, [course, mode, reset])

  const onSubmit = async (data: CourseFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && course) {
        await coursesApi.update(course.codigo, data)
      } else {
        await coursesApi.create(data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Curso" : "Agregar Curso"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información del curso"
              : "Completa la información para agregar un nuevo curso"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" {...register("codigo")} disabled={mode === "edit"} error={errors.codigo?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Curso</Label>
            <Input id="nombre" {...register("nombre")} error={errors.nombre?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel</Label>
              <Input id="nivel" {...register("nivel")} placeholder="Ej: 1ro, 2do" error={errors.nivel?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paralelo">Paralelo</Label>
              <Input id="paralelo" {...register("paralelo")} placeholder="Ej: A, B" error={errors.paralelo?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gestion">Gestión</Label>
              <Input
                id="gestion"
                type="number"
                {...register("gestion", { valueAsNumber: true })}
                error={errors.gestion?.message}
              />
            </div>
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
