"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { subjectsApi } from "@/lib/api"
import type { Subject } from "@/types/api"

const subjectSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  creditos: z.number().min(1, "Los créditos deben ser mayor a 0"),
  horas_semanales: z.number().min(1, "Las horas semanales deben ser mayor a 0"),
})

type SubjectFormData = z.infer<typeof subjectSchema>

interface SubjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function SubjectForm({ open, onOpenChange, subject, mode, onSuccess }: SubjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  })

  useEffect(() => {
    if (subject && mode === "edit") {
      reset({
        codigo: subject.codigo,
        nombre: subject.nombre,
        descripcion: subject.descripcion || "",
        creditos: subject.creditos,
        horas_semanales: subject.horas_semanales,
      })
    } else {
      reset({
        codigo: "",
        nombre: "",
        descripcion: "",
        creditos: 1,
        horas_semanales: 1,
      })
    }
  }, [subject, mode, reset])

  const onSubmit = async (data: SubjectFormData) => {
    setIsLoading(true)
    try {
      if (mode === "edit" && subject) {
        await subjectsApi.update(subject.codigo, data)
      } else {
        await subjectsApi.create(data)
      }
      onSuccess()
      reset()
    } catch (error) {
      console.error("Error saving subject:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Materia" : "Agregar Materia"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica la información de la materia"
              : "Completa la información para agregar una nueva materia"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" {...register("codigo")} disabled={mode === "edit"} error={errors.codigo?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Materia</Label>
            <Input id="nombre" {...register("nombre")} error={errors.nombre?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input id="descripcion" {...register("descripcion")} placeholder="Opcional" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="creditos">Créditos</Label>
              <Input
                id="creditos"
                type="number"
                min="1"
                {...register("creditos", { valueAsNumber: true })}
                error={errors.creditos?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas_semanales">Horas Semanales</Label>
              <Input
                id="horas_semanales"
                type="number"
                min="1"
                {...register("horas_semanales", { valueAsNumber: true })}
                error={errors.horas_semanales?.message}
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
