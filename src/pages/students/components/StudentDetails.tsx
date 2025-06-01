import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, getInitials } from "@/lib/utils"
import { Mail, Calendar, User, School, Users } from "lucide-react"
import type { Student } from "@/types/api"

interface StudentDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student | null
}

export function StudentDetails({ open, onOpenChange, student }: StudentDetailsProps) {
  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Estudiante</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="text-lg">{getInitials(student.nombre, student.apellido)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {student.nombre} {student.apellido}
                  </CardTitle>
                  <CardDescription>CI: {student.ci}</CardDescription>
                  <Badge variant={student.is_active ? "default" : "secondary"} className="mt-1">
                    {student.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(student.fecha_nacimiento)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">@{student.usuario_username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Registrado: {formatDate(student.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          {student.curso_actual && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Información Académica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Curso: </span>
                    <Badge variant="secondary">{student.curso_actual.nombre}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Nivel: </span>
                    <span>{student.curso_actual.nivel}</span>
                  </div>
                  <div>
                    <span className="font-medium">Paralelo: </span>
                    <span>{student.curso_actual.paralelo}</span>
                  </div>
                  <div>
                    <span className="font-medium">Gestión: </span>
                    <span>{student.curso_actual.gestion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tutores */}
          {student.tutores && student.tutores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tutores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.tutores.map((tutor, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="font-medium">{tutor.nombre_completo}</div>
                      <div className="text-sm text-muted-foreground">
                        {tutor.parentesco} • {tutor.telefono}
                      </div>
                      {tutor.email && <div className="text-sm text-muted-foreground">{tutor.email}</div>}
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
