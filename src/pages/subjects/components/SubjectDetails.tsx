import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { BookOpen, Clock, Award, Calendar } from "lucide-react"
import type { Subject } from "@/types/api"

interface SubjectDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject | null
}

export function SubjectDetails({ open, onOpenChange, subject }: SubjectDetailsProps) {
  if (!subject) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de la Materia</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{subject.nombre}</CardTitle>
                  <CardDescription>Código: {subject.codigo}</CardDescription>
                  <Badge variant={subject.is_active ? "default" : "secondary"} className="mt-2">
                    {subject.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          {/* Prerequisitos */}
          {subject.prerequisitos && subject.prerequisitos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subject.prerequisitos.map((prerequisito, index) => (
                    <Badge key={index} variant="outline">
                      {prerequisito}
                    </Badge>
                  ))}
                </div>
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
                  <span className="font-medium">Fecha de creación: </span>
                  <span>{formatDate(subject.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">Última actualización: </span>
                  <span>{formatDate(subject.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
