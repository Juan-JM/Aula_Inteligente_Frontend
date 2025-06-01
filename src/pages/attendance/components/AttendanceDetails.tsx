import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Calendar, User, Clock, FileText, School } from "lucide-react"
import type { Attendance } from "@/types/api"

interface AttendanceDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance | null
}

export function AttendanceDetails({ open, onOpenChange, attendance }: AttendanceDetailsProps) {
  if (!attendance) return null

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return <Badge variant="default">Presente</Badge>
      case "ausente":
        return <Badge variant="destructive">Ausente</Badge>
      case "tardanza":
        return <Badge variant="secondary">Tardanza</Badge>
      case "justificado":
        return <Badge variant="outline">Justificado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "presente":
        return "✓"
      case "ausente":
        return "✗"
      case "tardanza":
        return "⏰"
      case "justificado":
        return "📝"
      default:
        return "?"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Registro de Asistencia</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(attendance.estado)}</span>
                    {getStatusBadge(attendance.estado)}
                  </CardTitle>
                  <CardDescription className="mt-2">Registro del {formatDate(attendance.fecha)}</CardDescription>
                </div>
                <Calendar className="h-12 w-12 text-muted-foreground" />
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
                  <span>{attendance.estudiante_nombre}</span>
                </div>
                <div>
                  <span className="font-medium">CI: </span>
                  <span>{attendance.ci_estudiante}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Curso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-4 w-4" />
                Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Curso: </span>
                  <Badge variant="outline">{attendance.curso_nombre}</Badge>
                </div>
                <div>
                  <span className="font-medium">Código: </span>
                  <span>{attendance.codigo_curso}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles de Asistencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Detalles de Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Fecha: </span>
                  <span>{formatDate(attendance.fecha)}</span>
                </div>
                <div>
                  <span className="font-medium">Estado: </span>
                  {getStatusBadge(attendance.estado)}
                </div>
                {attendance.hora_llegada && (
                  <div>
                    <span className="font-medium">Hora de llegada: </span>
                    <span>{attendance.hora_llegada}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {attendance.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{attendance.observaciones}</p>
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
                  <span>{formatDate(attendance.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">ID de registro: </span>
                  <span>{attendance.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
