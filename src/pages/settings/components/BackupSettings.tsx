"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, Database, Clock, Upload, Trash2, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BackupConfig {
  enableAutoBackup: boolean
  backupFrequency: "daily" | "weekly" | "monthly"
  backupTime: string
  backupDay: number
  backupRetention: number
  backupLocation: "local" | "cloud" | "both"
  cloudProvider: "google" | "aws" | "azure" | "dropbox"
  cloudPath: string
  includeAttachments: boolean
  includeUserData: boolean
  compressBackups: boolean
  encryptBackups: boolean
  notifyOnCompletion: boolean
  notifyOnFailure: boolean
}

interface BackupHistory {
  id: string
  date: string
  size: string
  status: "success" | "failed"
  location: string
  type: "auto" | "manual"
}

export function BackupSettings() {
  const [config, setConfig] = useState<BackupConfig>({
    enableAutoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    backupDay: 1,
    backupRetention: 30,
    backupLocation: "both",
    cloudProvider: "google",
    cloudPath: "/backups/aula-inteligente",
    includeAttachments: true,
    includeUserData: true,
    compressBackups: true,
    encryptBackups: true,
    notifyOnCompletion: true,
    notifyOnFailure: true,
  })

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: "1",
      date: "2024-05-30 02:00:00",
      size: "245 MB",
      status: "success",
      location: "Local, Google Drive",
      type: "auto",
    },
    {
      id: "2",
      date: "2024-05-29 02:00:00",
      size: "242 MB",
      status: "success",
      location: "Local, Google Drive",
      type: "auto",
    },
    {
      id: "3",
      date: "2024-05-28 15:32:10",
      size: "240 MB",
      status: "success",
      location: "Local",
      type: "manual",
    },
    {
      id: "4",
      date: "2024-05-27 02:00:00",
      size: "0 KB",
      status: "failed",
      location: "N/A",
      type: "auto",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de respaldos guardada",
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

  const startBackup = async () => {
    setBackupInProgress(true)
    setBackupProgress(0)

    try {
      // Simulación del proceso de respaldo
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setBackupProgress(i)
      }

      // Agregar el nuevo respaldo al historial
      const newBackup: BackupHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        size: "248 MB",
        status: "success",
        location: config.backupLocation === "both" ? "Local, Google Drive" : config.backupLocation,
        type: "manual",
      }

      setBackupHistory([newBackup, ...backupHistory])

      toast({
        title: "Respaldo completado",
        description: "El respaldo se ha creado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el respaldo.",
        variant: "destructive",
      })
    } finally {
      setBackupInProgress(false)
    }
  }

  const startRestore = async (backupId: string) => {
    setRestoreInProgress(true)
    setRestoreProgress(0)

    try {
      // Simulación del proceso de restauración
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setRestoreProgress(i)
      }

      toast({
        title: "Restauración completada",
        description: "El sistema se ha restaurado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la restauración.",
        variant: "destructive",
      })
    } finally {
      setRestoreInProgress(false)
    }
  }

  const deleteBackup = (backupId: string) => {
    setBackupHistory(backupHistory.filter((backup) => backup.id !== backupId))
    toast({
      title: "Respaldo eliminado",
      description: "El respaldo ha sido eliminado correctamente.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Respaldos Automáticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Respaldos Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Respaldos Automáticos</Label>
                <p className="text-sm text-muted-foreground">Habilitar respaldos programados</p>
              </div>
              <Switch
                checked={config.enableAutoBackup}
                onCheckedChange={(checked) => setConfig({ ...config, enableAutoBackup: checked })}
              />
            </div>

            {config.enableAutoBackup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Frecuencia</Label>
                  <Select
                    value={config.backupFrequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setConfig({ ...config, backupFrequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupTime">Hora del Respaldo</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={config.backupTime}
                    onChange={(e) => setConfig({ ...config, backupTime: e.target.value })}
                  />
                </div>

                {config.backupFrequency === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="backupDay">Día de la Semana</Label>
                    <Select
                      value={config.backupDay.toString()}
                      onValueChange={(value) => setConfig({ ...config, backupDay: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar día" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lunes</SelectItem>
                        <SelectItem value="2">Martes</SelectItem>
                        <SelectItem value="3">Miércoles</SelectItem>
                        <SelectItem value="4">Jueves</SelectItem>
                        <SelectItem value="5">Viernes</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                        <SelectItem value="0">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.backupFrequency === "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="backupDay">Día del Mes</Label>
                    <Input
                      id="backupDay"
                      type="number"
                      min="1"
                      max="28"
                      value={config.backupDay}
                      onChange={(e) => setConfig({ ...config, backupDay: Number.parseInt(e.target.value) })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="backupRetention">Retención (días)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    min="1"
                    max="365"
                    value={config.backupRetention}
                    onChange={(e) => setConfig({ ...config, backupRetention: Number.parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Configuración de Almacenamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backupLocation">Ubicación de Respaldos</Label>
              <Select
                value={config.backupLocation}
                onValueChange={(value: "local" | "cloud" | "both") => setConfig({ ...config, backupLocation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Solo Local</SelectItem>
                  <SelectItem value="cloud">Solo Nube</SelectItem>
                  <SelectItem value="both">Local y Nube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(config.backupLocation === "cloud" || config.backupLocation === "both") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cloudProvider">Proveedor de Nube</Label>
                  <Select
                    value={config.cloudProvider}
                    onValueChange={(value: "google" | "aws" | "azure" | "dropbox") =>
                      setConfig({ ...config, cloudProvider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Drive</SelectItem>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cloudPath">Ruta en la Nube</Label>
                  <Input
                    id="cloudPath"
                    value={config.cloudPath}
                    onChange={(e) => setConfig({ ...config, cloudPath: e.target.value })}
                    placeholder="/backups/aula-inteligente"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Incluir Adjuntos</Label>
                <Switch
                  checked={config.includeAttachments}
                  onCheckedChange={(checked) => setConfig({ ...config, includeAttachments: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Incluir Datos de Usuarios</Label>
                <Switch
                  checked={config.includeUserData}
                  onCheckedChange={(checked) => setConfig({ ...config, includeUserData: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Comprimir Respaldos</Label>
                <Switch
                  checked={config.compressBackups}
                  onCheckedChange={(checked) => setConfig({ ...config, compressBackups: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Encriptar Respaldos</Label>
                <Switch
                  checked={config.encryptBackups}
                  onCheckedChange={(checked) => setConfig({ ...config, encryptBackups: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar al Completar</Label>
                <p className="text-sm text-muted-foreground">Enviar notificación cuando el respaldo se complete</p>
              </div>
              <Switch
                checked={config.notifyOnCompletion}
                onCheckedChange={(checked) => setConfig({ ...config, notifyOnCompletion: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificar Fallos</Label>
                <p className="text-sm text-muted-foreground">Enviar notificación cuando el respaldo falle</p>
              </div>
              <Switch
                checked={config.notifyOnFailure}
                onCheckedChange={(checked) => setConfig({ ...config, notifyOnFailure: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Respaldo Manual */}
      <Card>
        <CardHeader>
          <CardTitle>Respaldo Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cree un respaldo manual del sistema con la configuración actual. Este proceso puede tardar varios minutos
              dependiendo del tamaño de la base de datos.
            </p>

            {backupInProgress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Respaldo en progreso...</span>
                  <span className="text-sm">{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
              </div>
            ) : (
              <Button onClick={startBackup} className="w-full sm:w-auto">
                <Database className="h-4 w-4 mr-2" />
                Iniciar Respaldo Manual
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Respaldos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Tamaño</th>
                  <th className="text-left py-2 px-2">Estado</th>
                  <th className="text-left py-2 px-2">Ubicación</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-right py-2 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="border-b">
                    <td className="py-2 px-2">{backup.date}</td>
                    <td className="py-2 px-2">{backup.size}</td>
                    <td className="py-2 px-2">
                      {backup.status === "success" ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Éxito
                        </span>
                      ) : (
                        <span className="text-red-600">Fallido</span>
                      )}
                    </td>
                    <td className="py-2 px-2">{backup.location}</td>
                    <td className="py-2 px-2">{backup.type === "auto" ? "Automático" : "Manual"}</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex justify-end gap-2">
                        {backup.status === "success" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startRestore(backup.id)}
                            disabled={restoreInProgress}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteBackup(backup.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {restoreInProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Restauración en progreso...</span>
                <span className="text-sm">{restoreProgress}%</span>
              </div>
              <Progress value={restoreProgress} className="h-2" />
            </div>
          )}
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
