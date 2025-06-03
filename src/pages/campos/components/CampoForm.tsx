"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { camposApi } from "@/lib/api"
import type { Campo } from "@/types/api"

const campoSchema = z.object({
  codigo: z.string().min(1, "El código es requerido").max(20, "El código no puede exceder 20 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  valor: z.number().min(0, "El valor debe ser mayor a 0").max(100, "El valor no puede exceder 100%"),
})

type CampoFormData = z.infer<typeof campoSchema>

interface CampoFormProps {
  campo?: Campo | null
  onSuccess: () => void
  onCancel: () => void
}

export function CampoForm({ campo, onSuccess, onCancel }: CampoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!campo

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampoFormData>({
    resolver: zodResolver(campoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      valor: 0,
    },
  })

  useEffect(() => {
    if (campo) {
      setValue("codigo", campo.codigo)
      setValue("nombre", campo.nombre)
      setValue("valor", campo.valor)
    }
  }, [campo, setValue])

  const onSubmit = async (data: CampoFormData) => {
    try {
      setIsLoading(true)

      if (isEditing && campo) {
        await camposApi.update(campo.codigo, data)
      } else {
        await camposApi.create(data)
      }

      onSuccess()
    } catch (error: any) {
      console.error("Error saving campo:", error)
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
            placeholder="Ej: CAM-01"
            disabled={isEditing} // No permitir cambiar código en edición
          />
          {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor (%) *</Label>
          <Input
            id="valor"
            type="number"
            min="0"
            max="100"
            {...register("valor", { valueAsNumber: true })}
            placeholder="Ej: 45"
          />
          {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input id="nombre" {...register("nombre")} placeholder="Ej: Saber" />
        {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
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
