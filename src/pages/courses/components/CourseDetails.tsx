import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { School, User, Users, Calendar } from "lucide-react"
import type { Course } from "@/types/api"

interface CourseDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
}

export function CourseDetails({ open, onOpenChange, course }: CourseDetailsProps) {
  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Curso</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{course.nombre}</CardTitle>
                  <CardDescription>
                    {course.nivel} "{course.paralelo}" - Gestión {course.gestion}
                  </CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">Código: {course.codigo}</Badge>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                <School className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Creado: {formatDate(course.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{course.total_estudiantes || 0} estudiantes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Docente Titular */}
          {course.docente_titular && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Docente Titular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Nombre: </span>
                    <span>{course.docente_titular.nombre_completo}</span>
                  </div>
                  <div>
                    <span className="font-medium">CI: </span>
                    <span>{course.docente_titular.ci}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Fecha de creación: </span>
                  <span>{formatDate(course.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">Última actualización: </span>
                  <span>{formatDate(course.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
