"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Phone, MapPin, Calendar, Shield, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { getInitials, formatDate } from "@/lib/utils"

const profileSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: user?.profile?.phone || "",
      address: user?.profile?.address || "",
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      // Aquí harías la llamada a la API para actualizar el perfil
      console.log("Updating profile:", data)

      // Simular actualización
      if (user) {
        const updatedUser = {
          ...user,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          profile: {
            ...user.profile,
            phone: data.phone,
            address: data.address,
          },
        }
        updateUser(updatedUser)
      }

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (!user) {
    return <div>Cargando perfil...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Personal */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal</CardDescription>
                </div>
                {!isEditing && <Button onClick={() => setIsEditing(true)}>Editar</Button>}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input
                      id="first_name"
                      {...register("first_name")}
                      disabled={!isEditing}
                      error={errors.first_name?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input
                      id="last_name"
                      {...register("last_name")}
                      disabled={!isEditing}
                      error={errors.last_name?.message}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={!isEditing}
                    error={errors.email?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" {...register("phone")} disabled={!isEditing} placeholder="Opcional" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" {...register("address")} disabled={!isEditing} placeholder="Opcional" />
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button type="submit" disabled={!isDirty || isLoading}>
                      {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con Avatar y Roles */}
        <div className="space-y-6">
          {/* Avatar y Info Básica */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>

              {user.profile?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.profile.phone}</span>
                </div>
              )}

              {user.profile?.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.profile.address}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Miembro desde {formatDate(user.date_joined)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Roles y Permisos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles y Permisos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Grupos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.groups.map((group) => (
                    <Badge key={group} variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              {user.user_permissions && user.user_permissions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Permisos Específicos</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.user_permissions.slice(0, 5).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.split(".").pop()}
                      </Badge>
                    ))}
                    {user.user_permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.user_permissions.length - 5} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Cuenta Activa" : "Cuenta Inactiva"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
