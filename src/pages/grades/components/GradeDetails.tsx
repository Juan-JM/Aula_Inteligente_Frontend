import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { GraduationCap, BookOpen, User, Calendar, FileText } from "lucide-react"
import type { Grade } from "@/types/api"

interface GradeDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grade: Grade | null
}

export function GradeDetails({ open, onOpenChange, grade }: GradeDetailsProps) {
  if (!grade) return null

  const getGradeColor = (nota: number) => {
    if (nota >= 70) return "default"
    if (nota >= 50) return "secondary"
    return "destructive"
  }

  const getGradeStatus = (nota: number) => {
    if (nota >= 70) return "Aprobado"
    if (nota >= 50) return "Regular"
    return "Reprobado"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Calificación</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    <Badge variant={getGradeColor(grade.nota)} className="text-lg font-mono px-3 py-1">
                      {grade.nota.toFixed(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{getGradeStatus(grade.nota)}</CardDescription>
                </div>
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          {/* Información del Estudiante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Nombre: </span>
                  <span>{grade.estudiante_nombre}</span>
                </div>
                <div>
                  <span className="font-medium">CI: </span>
                  <span>{grade.ci_estudiante}</span>
                </div>
                <div>
                  <span className="font-medium">Curso: </span>
                  <Badge variant="outline">{grade.curso_nombre}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Información Académica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Materia: </span>
                  <span>{grade.materia_nombre}</span>
                </div>
                <div>
                  <span className="font-medium">Criterio de Evaluación: </span>
                  <span>{grade.criterio_descripcion}</span>
                </div>
                <div>
                  <span className="font-medium">Período: </span>
                  <Badge variant="secondary">{grade.periodo_nombre}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {grade.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{grade.observaciones}</p>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Fecha de registro: </span>
                  <span>{formatDate(grade.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">ID de registro: </span>
                  <span>{grade.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
