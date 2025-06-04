"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { User, Calendar, FileText } from "lucide-react"
import type { Inscripcion } from "@/types/api"

interface InscripcionDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inscripcion: Inscripcion | null
}

export function InscripcionDetails({ open, onOpenChange, inscripcion }: InscripcionDetailsProps) {
  if (!inscripcion) return null

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "default"
      case "RETIRADO":
        return "destructive"
      case "TRASLADADO":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Inscripción</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información de la Inscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="font-medium">Estudiante:</span>
                  <p className="text-sm text-muted-foreground">{inscripcion.estudiante_nombre}</p>
                </div>
                <div>
                  <span className="font-medium">CI:</span>
                  <p className="text-sm text-muted-foreground">{inscripcion.ci_estudiante}</p>
                </div>
                <div>
                  <span className="font-medium">Curso:</span>
                  <p className="text-sm text-muted-foreground">{inscripcion.curso_nombre}</p>
                </div>
                <div>
                  <span className="font-medium">Estado:</span>
                  <Badge variant={getEstadoBadgeVariant(inscripcion.estado)} className="ml-2">
                    {inscripcion.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="font-medium">Fecha de Inscripción:</span>
                  <p className="text-sm text-muted-foreground">{formatDate(inscripcion.fecha_inscripcion)}</p>
                </div>
                {inscripcion.fecha_baja && (
                  <div>
                    <span className="font-medium">Fecha de Baja:</span>
                    <p className="text-sm text-muted-foreground">{formatDate(inscripcion.fecha_baja)}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Fecha de Registro:</span>
                  <p className="text-sm text-muted-foreground">{formatDate(inscripcion.created_at)}</p>
                </div>
                <div>
                  <span className="font-medium">Última Actualización:</span>
                  <p className="text-sm text-muted-foreground">{formatDate(inscripcion.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivo de Baja */}
          {inscripcion.motivo_baja && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Motivo de Baja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{inscripcion.motivo_baja}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
