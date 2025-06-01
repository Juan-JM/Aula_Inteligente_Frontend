"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Save, Shield, AlertTriangle, Eye, Lock, Activity } from "lucide-react"

export function SecuritySettings() {
  const [config, setConfig] = useState({
    auditLogging: true,
    loginLogging: true,
    dataChangeLogging: true,
    failedLoginLogging: true,
    logRetentionDays: 90,
    enableFirewall: true,
    allowedIPs: ["192.168.1.0/24"],
    blockedIPs: [],
    enableRateLimit: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    enableSSL: true,
    forceHTTPS: true,
    enableCSRF: true,
    enableXSS: true,
    enableSQLInjection: true,
  })

  const [newIP, setNewIP] = useState("")
  const [newBlockedIP, setNewBlockedIP] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de seguridad guardada",
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

  const addAllowedIP = () => {
    if (newIP && !config.allowedIPs.includes(newIP)) {
      setConfig({ ...config, allowedIPs: [...config.allowedIPs, newIP] })
      setNewIP("")
    }
  }

  const removeAllowedIP = (ip: string) => {
    setConfig({ ...config, allowedIPs: config.allowedIPs.filter((i) => i !== ip) })
  }

  const addBlockedIP = () => {
    if (newBlockedIP && !config.blockedIPs.includes(newBlockedIP)) {
      setConfig({ ...config, blockedIPs: [...config.blockedIPs, newBlockedIP] })
      setNewBlockedIP("")
    }
  }

  const removeBlockedIP = (ip: string) => {
    setConfig({ ...config, blockedIPs: config.blockedIPs.filter((i) => i !== ip) })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auditoría y Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Auditoría y Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Registro de Auditoría</Label>
                <p className="text-sm text-muted-foreground">Registrar todas las acciones del sistema</p>
              </div>
              <Switch
                checked={config.auditLogging}
                onCheckedChange={(checked) => setConfig({ ...config, auditLogging: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Registro de Inicios de Sesión</Label>
                <p className="text-sm text-muted-foreground">Registrar intentos de login exitosos</p>
              </div>
              <Switch
                checked={config.loginLogging}
                onCheckedChange={(checked) => setConfig({ ...config, loginLogging: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Registro de Cambios de Datos</Label>
                <p className="text-sm text-muted-foreground">Registrar modificaciones de datos</p>
              </div>
              <Switch
                checked={config.dataChangeLogging}
                onCheckedChange={(checked) => setConfig({ ...config, dataChangeLogging: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Registro de Fallos de Login</Label>
                <p className="text-sm text-muted-foreground">Registrar intentos de login fallidos</p>
              </div>
              <Switch
                checked={config.failedLoginLogging}
                onCheckedChange={(checked) => setConfig({ ...config, failedLoginLogging: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logRetention">Retención de Logs (días)</Label>
              <Input
                id="logRetention"
                type="number"
                min="30"
                max="365"
                value={config.logRetentionDays}
                onChange={(e) => setConfig({ ...config, logRetentionDays: Number.parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Protección de Red */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Protección de Red
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Firewall Habilitado</Label>
                <p className="text-sm text-muted-foreground">Filtrar acceso por IP</p>
              </div>
              <Switch
                checked={config.enableFirewall}
                onCheckedChange={(checked) => setConfig({ ...config, enableFirewall: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Límite de Velocidad</Label>
                <p className="text-sm text-muted-foreground">Limitar requests por IP</p>
              </div>
              <Switch
                checked={config.enableRateLimit}
                onCheckedChange={(checked) => setConfig({ ...config, enableRateLimit: checked })}
              />
            </div>

            {config.enableRateLimit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimitRequests">Requests Máximos</Label>
                  <Input
                    id="rateLimitRequests"
                    type="number"
                    min="10"
                    value={config.rateLimitRequests}
                    onChange={(e) => setConfig({ ...config, rateLimitRequests: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitWindow">Ventana (minutos)</Label>
                  <Input
                    id="rateLimitWindow"
                    type="number"
                    min="1"
                    value={config.rateLimitWindow}
                    onChange={(e) => setConfig({ ...config, rateLimitWindow: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>SSL/TLS Habilitado</Label>
                <p className="text-sm text-muted-foreground">Conexiones seguras HTTPS</p>
              </div>
              <Switch
                checked={config.enableSSL}
                onCheckedChange={(checked) => setConfig({ ...config, enableSSL: checked })}
              />
            </div>

            {config.enableSSL && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Forzar HTTPS</Label>
                  <p className="text-sm text-muted-foreground">Redirigir HTTP a HTTPS</p>
                </div>
                <Switch
                  checked={config.forceHTTPS}
                  onCheckedChange={(checked) => setConfig({ ...config, forceHTTPS: checked })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control de Acceso por IP */}
      {config.enableFirewall && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                IPs Permitidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.0/24 o 192.168.1.100"
                />
                <Button onClick={addAllowedIP} variant="outline">
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {config.allowedIPs.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-mono">{ip}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeAllowedIP(ip)}>
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                IPs Bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newBlockedIP}
                  onChange={(e) => setNewBlockedIP(e.target.value)}
                  placeholder="192.168.1.100"
                />
                <Button onClick={addBlockedIP} variant="outline">
                  Bloquear
                </Button>
              </div>
              <div className="space-y-2">
                {config.blockedIPs.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm font-mono">{ip}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeBlockedIP(ip)}>
                      Desbloquear
                    </Button>
                  </div>
                ))}
                {config.blockedIPs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay IPs bloqueadas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Protecciones de Aplicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Protecciones de Aplicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Protección CSRF</Label>
                <p className="text-sm text-muted-foreground">Cross-Site Request Forgery</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.enableCSRF}
                  onCheckedChange={(checked) => setConfig({ ...config, enableCSRF: checked })}
                />
                <Badge variant={config.enableCSRF ? "default" : "secondary"}>{config.enableCSRF ? "ON" : "OFF"}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Protección XSS</Label>
                <p className="text-sm text-muted-foreground">Cross-Site Scripting</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.enableXSS}
                  onCheckedChange={(checked) => setConfig({ ...config, enableXSS: checked })}
                />
                <Badge variant={config.enableXSS ? "default" : "secondary"}>{config.enableXSS ? "ON" : "OFF"}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Protección SQL Injection</Label>
                <p className="text-sm text-muted-foreground">Inyección de código SQL</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.enableSQLInjection}
                  onCheckedChange={(checked) => setConfig({ ...config, enableSQLInjection: checked })}
                />
                <Badge variant={config.enableSQLInjection ? "default" : "secondary"}>
                  {config.enableSQLInjection ? "ON" : "OFF"}
                </Badge>
              </div>
            </div>
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
