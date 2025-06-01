"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, User, BookOpen, GraduationCap, Star, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Participation } from "@/types/api"

interface ParticipationDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participation: Participation | null
}

export function ParticipationDetails({ open, onOpenChange, participation }: ParticipationDetailsProps) {
  if (!participation) return null

  const getParticipationLevel = (calificacion: number) => {
    if (calificacion >= 4.5) return { label: "Excelente", color: "default", stars: 5 }
    if (calificacion >= 3.5) return { label: "Bueno", color: "secondary", stars: 4 }
    if (calificacion >= 2.5) return { label: "Regular", color: "outline", stars: 3 }
    return { label: "Deficiente", color: "destructive", stars: 2 }
  }

  const level = getParticipationLevel(participation.calificacion)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Detalles de Participación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con calificación */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{participation.tipo_participacion}</h3>
                  <p className="text-muted-foreground">{formatDate(participation.fecha)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{participation.calificacion.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">/ 5.0</div>
                  <Badge variant={level.color as any} className="mt-1">
                    {level.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del estudiante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="font-medium">{participation.estudiante_nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cédula de Identidad</p>
                  <p className="font-medium">{participation.ci_estudiante}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información académica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Información Académica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Curso</p>
                  <p className="font-medium">{participation.curso_nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Materia</p>
                  <p className="font-medium">{participation.materia_nombre}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de la participación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Detalles de la Participación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(participation.fecha)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <Badge variant="outline">{participation.tipo_participacion}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Calificación</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < level.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{participation.calificacion.toFixed(1)}/5.0</span>
                </div>
              </div>

              {participation.observaciones && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Observaciones
                  </p>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm">{participation.observaciones}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de registro */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">
                <p>Registrado el: {formatDate(participation.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
