import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Shield, Key, Calendar } from "lucide-react"
import type { Role } from "@/types/api"

interface RoleDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
}

export function RoleDetails({ open, onOpenChange, role }: RoleDetailsProps) {
  if (!role) return null

  // Agrupar permisos por app
  const groupedPermissions = role.permissions.reduce(
    (acc, permission) => {
      const app = permission.codename.split(".")[0] || "general"
      if (!acc[app]) {
        acc[app] = []
      }
      acc[app].push(permission)
      return acc
    },
    {} as Record<string, typeof role.permissions>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Rol</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <CardDescription>ID: {role.id}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{role.permissions.length} permisos</Badge>
                    <Badge variant="secondary">{role.user_count || 0} usuarios</Badge>
                  </div>
                </div>
                <Shield className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          {/* Permisos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Permisos Asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([app, appPermissions]) => (
                  <div key={app}>
                    <h4 className="font-medium capitalize mb-2">{app}</h4>
                    <div className="flex flex-wrap gap-2">
                      {appPermissions.map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <span>{formatDate(role.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium">Última actualización: </span>
                  <span>{formatDate(role.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
