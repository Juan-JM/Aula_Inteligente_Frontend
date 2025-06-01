import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, getInitials } from "@/lib/utils"
import { Mail, Calendar, User, Phone, GraduationCap, BookOpen } from "lucide-react"
import type { Teacher } from "@/types/api"

interface TeacherDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
}

export function TeacherDetails({ open, onOpenChange, teacher }: TeacherDetailsProps) {
  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Docente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="text-lg">{getInitials(teacher.nombre, teacher.apellido)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {teacher.nombre} {teacher.apellido}
                  </CardTitle>
                  <CardDescription>CI: {teacher.ci}</CardDescription>
                  <Badge variant={teacher.is_active ? "default" : "secondary"} className="mt-1">
                    {teacher.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{teacher.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">@{teacher.usuario_username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ingreso: {formatDate(teacher.fecha_ingreso)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Información Académica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teacher.especialidad && (
                  <div>
                    <span className="font-medium">Especialidad: </span>
                    <Badge variant="secondary">{teacher.especialidad}</Badge>
                  </div>
                )}
                {teacher.titulo && (
                  <div>
                    <span className="font-medium">Título: </span>
                    <span>{teacher.titulo}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Registrado: </span>
                  <span>{formatDate(teacher.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materias Asignadas */}
          {teacher.materias_asignadas && teacher.materias_asignadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Materias Asignadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teacher.materias_asignadas.map((materia, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium">{materia.materia}</div>
                      <div className="text-sm text-muted-foreground">
                        {materia.curso} - {materia.nivel} "{materia.paralelo}"
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
