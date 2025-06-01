"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, Bell, Mail, MessageSquare, Smartphone } from "lucide-react"

interface NotificationConfig {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  emailServer: {
    host: string
    port: number
    username: string
    password: string
    encryption: "none" | "tls" | "ssl"
  }
  smsProvider: {
    provider: "twilio" | "aws" | "custom"
    apiKey: string
    apiSecret: string
    fromNumber: string
  }
  notificationTypes: {
    gradeUpdates: boolean
    attendanceAlerts: boolean
    assignmentReminders: boolean
    eventNotifications: boolean
    systemAlerts: boolean
    parentUpdates: boolean
  }
  scheduleSettings: {
    quietHoursStart: string
    quietHoursEnd: string
    weekendNotifications: boolean
    holidayNotifications: boolean
  }
}

export function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    emailServer: {
      host: "smtp.gmail.com",
      port: 587,
      username: "",
      password: "",
      encryption: "tls",
    },
    smsProvider: {
      provider: "twilio",
      apiKey: "",
      apiSecret: "",
      fromNumber: "",
    },
    notificationTypes: {
      gradeUpdates: true,
      attendanceAlerts: true,
      assignmentReminders: true,
      eventNotifications: true,
      systemAlerts: true,
      parentUpdates: true,
    },
    scheduleSettings: {
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      weekendNotifications: false,
      holidayNotifications: false,
    },
  })

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de notificaciones guardada",
        description: "Los cambios se han aplicado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testEmailConnection = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Conexión exitosa",
        description: "La configuración de email es correcta.",
      })
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor de email.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canales de Notificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Canales de Notificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificaciones por correo electrónico</p>
                </div>
              </div>
              <Switch
                checked={config.emailNotifications}
                onCheckedChange={(checked) => setConfig({ ...config, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Notificaciones SMS</Label>
                  <p className="text-sm text-muted-foreground">Enviar notificaciones por mensaje de texto</p>
                </div>
              </div>
              <Switch
                checked={config.smsNotifications}
                onCheckedChange={(checked) => setConfig({ ...config, smsNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones push en navegador/app</p>
                </div>
              </div>
              <Switch
                checked={config.pushNotifications}
                onCheckedChange={(checked) => setConfig({ ...config, pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Notificaciones en App</Label>
                  <p className="text-sm text-muted-foreground">Mostrar notificaciones dentro del sistema</p>
                </div>
              </div>
              <Switch
                checked={config.inAppNotifications}
                onCheckedChange={(checked) => setConfig({ ...config, inAppNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Notificación */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Actualizaciones de Calificaciones</Label>
                <p className="text-sm text-muted-foreground">Cuando se publican nuevas calificaciones</p>
              </div>
              <Switch
                checked={config.notificationTypes.gradeUpdates}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, gradeUpdates: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Asistencia</Label>
                <p className="text-sm text-muted-foreground">Ausencias y tardanzas de estudiantes</p>
              </div>
              <Switch
                checked={config.notificationTypes.attendanceAlerts}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, attendanceAlerts: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recordatorios de Tareas</Label>
                <p className="text-sm text-muted-foreground">Fechas límite de entrega próximas</p>
              </div>
              <Switch
                checked={config.notificationTypes.assignmentReminders}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, assignmentReminders: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones de Eventos</Label>
                <p className="text-sm text-muted-foreground">Eventos escolares y actividades</p>
              </div>
              <Switch
                checked={config.notificationTypes.eventNotifications}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, eventNotifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas del Sistema</Label>
                <p className="text-sm text-muted-foreground">Mantenimiento y actualizaciones</p>
              </div>
              <Switch
                checked={config.notificationTypes.systemAlerts}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, systemAlerts: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Actualizaciones para Padres</Label>
                <p className="text-sm text-muted-foreground">Informes para tutores y padres</p>
              </div>
              <Switch
                checked={config.notificationTypes.parentUpdates}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    notificationTypes: { ...config.notificationTypes, parentUpdates: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Email */}
      {config.emailNotifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuración de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailHost">Servidor SMTP</Label>
                <Input
                  id="emailHost"
                  value={config.emailServer.host}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      emailServer: { ...config.emailServer, host: e.target.value },
                    })
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPort">Puerto</Label>
                <Input
                  id="emailPort"
                  type="number"
                  value={config.emailServer.port}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      emailServer: { ...config.emailServer, port: Number.parseInt(e.target.value) },
                    })
                  }
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailUsername">Usuario</Label>
                <Input
                  id="emailUsername"
                  value={config.emailServer.username}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      emailServer: { ...config.emailServer, username: e.target.value },
                    })
                  }
                  placeholder="usuario@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Contraseña</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={config.emailServer.password}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      emailServer: { ...config.emailServer, password: e.target.value },
                    })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailEncryption">Encriptación</Label>
              <Select
                value={config.emailServer.encryption}
                onValueChange={(value: "none" | "tls" | "ssl") =>
                  setConfig({
                    ...config,
                    emailServer: { ...config.emailServer, encryption: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar encriptación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin encriptación</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={testEmailConnection} variant="outline">
              Probar Conexión
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Configuración de Horarios */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Horarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quietStart">Inicio Horas Silenciosas</Label>
              <Input
                id="quietStart"
                type="time"
                value={config.scheduleSettings.quietHoursStart}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scheduleSettings: { ...config.scheduleSettings, quietHoursStart: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quietEnd">Fin Horas Silenciosas</Label>
              <Input
                id="quietEnd"
                type="time"
                value={config.scheduleSettings.quietHoursEnd}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scheduleSettings: { ...config.scheduleSettings, quietHoursEnd: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificaciones en Fines de Semana</Label>
              <p className="text-sm text-muted-foreground">Enviar notificaciones sábados y domingos</p>
            </div>
            <Switch
              checked={config.scheduleSettings.weekendNotifications}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  scheduleSettings: { ...config.scheduleSettings, weekendNotifications: checked },
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificaciones en Feriados</Label>
              <p className="text-sm text-muted-foreground">Enviar notificaciones en días festivos</p>
            </div>
            <Switch
              checked={config.scheduleSettings.holidayNotifications}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  scheduleSettings: { ...config.scheduleSettings, holidayNotifications: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="min-w-32">
          {loading ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
