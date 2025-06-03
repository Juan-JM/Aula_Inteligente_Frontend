"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { periodosApi } from "@/lib/api"
import type { Periodo } from "@/types/api"

const periodoSchema = z.object({
  codigo: z.string().min(1, "El código es requerido").max(20, "El código no puede exceder 20 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
})

type PeriodoFormData = z.infer<typeof periodoSchema>

interface PeriodoFormProps {
  periodo?: Periodo | null
  onSuccess: () => void
  onCancel: () => void
}

export function PeriodoForm({ periodo, onSuccess, onCancel }: PeriodoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!periodo

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PeriodoFormData>({
    resolver: zodResolver(periodoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
    },
  })

  useEffect(() => {
    if (periodo) {
      setValue("codigo", periodo.codigo)
      setValue("nombre", periodo.nombre)
    }
  }, [periodo, setValue])

  const onSubmit = async (data: PeriodoFormData) => {
    try {
      setIsLoading(true)

      if (isEditing && periodo) {
        await periodosApi.update(periodo.codigo, data)
      } else {
        await periodosApi.create(data)
      }

      onSuccess()
    } catch (error: any) {
      console.error("Error saving periodo:", error)
      // Handle validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data
        Object.keys(backendErrors).forEach((key) => {
          if (key in data) {
            // Set field errors if they match form fields
          }
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            {...register("codigo")}
            placeholder="Ej: T1-2024"
            disabled={isEditing} // No permitir cambiar código en edición
          />
          {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" {...register("nombre")} placeholder="Ej: Primer Trimestre 2024" />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}
