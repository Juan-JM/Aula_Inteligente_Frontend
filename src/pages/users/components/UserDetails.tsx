import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, getInitials } from "@/lib/utils"
import { Mail, Calendar, User, Users, Key } from "lucide-react"
import type { User as UserType } from "@/types/api"

interface UserDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType | null
}

export function UserDetails({ open, onOpenChange, user }: UserDetailsProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    {user.first_name} {user.last_name}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    {user.is_staff && <Badge variant="outline">Staff</Badge>}
                    {user.is_superuser && <Badge variant="destructive">Superuser</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ID: {user.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Registrado: {formatDate(user.date_joined)}</span>
                </div>
                {user.last_login && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Último acceso: {formatDate(user.last_login)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          {user.groups && user.groups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles Asignados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.groups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.permissions.length} permisos asignados
                          </div>
                        </div>
                        <Badge variant="secondary">ID: {group.id}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permisos Específicos */}
          {user.user_permissions && user.user_permissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Permisos Específicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.user_permissions.map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs">
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Perfil */}
          {user.profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {user.profile.phone && (
                    <div>
                      <span className="font-medium">Teléfono: </span>
                      <span>{user.profile.phone}</span>
                    </div>
                  )}
                  {user.profile.address && (
                    <div>
                      <span className="font-medium">Dirección: </span>
                      <span>{user.profile.address}</span>
                    </div>
                  )}
                  {user.profile.birth_date && (
                    <div>
                      <span className="font-medium">Fecha de nacimiento: </span>
                      <span>{formatDate(user.profile.birth_date)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
