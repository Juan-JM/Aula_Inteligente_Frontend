import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/lib/utils"
import { Mail, Phone, MapPin, Briefcase, Users, User } from "lucide-react"
import type { Tutor } from "@/types/api"

interface TutorDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutor: Tutor | null
}

const PARENTESCO_LABELS: Record<string, string> = {
  PADRE: "Padre",
  MADRE: "Madre",
  TUTOR_LEGAL: "Tutor Legal",
  ABUELO: "Abuelo",
  ABUELA: "Abuela",
  TIO: "Tío",
  TIA: "Tía",
  HERMANO: "Hermano",
  HERMANA: "Hermana",
  OTRO: "Otro",
}

export function TutorDetails({ open, onOpenChange, tutor }: TutorDetailsProps) {
  if (!tutor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Tutor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="text-lg">{getInitials(tutor.nombre, tutor.apellido)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {tutor.nombre} {tutor.apellido}
                  </CardTitle>
                  <CardDescription>CI: {tutor.ci}</CardDescription>
                  <Badge variant={tutor.is_active ? "default" : "secondary"} className="mt-1">
                    {tutor.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.telefono}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estudiantes a Cargo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Estudiantes a Cargo
                {tutor.estudiantes_asignados && (
                  <Badge variant="outline" className="ml-2">
                    {tutor.estudiantes_asignados.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Estudiantes asignados a este tutor y su relación familiar</CardDescription>
            </CardHeader>
            <CardContent>
              {!tutor.estudiantes_asignados || tutor.estudiantes_asignados.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay estudiantes asignados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tutor.estudiantes_asignados.map((estudiante, index) => (
                    <div key={index}>
                      <div className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" />
                            <AvatarFallback>
                              {getInitials(
                                estudiante.nombre_completo.split(" ")[0],
                                estudiante.nombre_completo.split(" ")[1] || "",
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium">{estudiante.nombre_completo}</div>
                            <div className="text-sm text-muted-foreground">CI: {estudiante.ci}</div>
                            {estudiante.email && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {estudiante.email}
                              </div>
                            )}
                            {estudiante.telefono && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {estudiante.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {PARENTESCO_LABELS[estudiante.parentesco] || estudiante.parentesco}
                          </Badge>
                          {estudiante.edad && (
                            <div className="text-sm text-muted-foreground mt-1">{estudiante.edad} años</div>
                          )}
                        </div>
                      </div>
                      {index < (tutor.estudiantes_asignados?.length || 0) - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de registro:</span>
                  <span>{new Date(tutor.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span>{new Date(tutor.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant={tutor.is_active ? "default" : "secondary"}>
                    {tutor.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
