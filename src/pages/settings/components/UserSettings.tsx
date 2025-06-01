"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Save, Users, Shield, Clock, Key } from "lucide-react"

interface UserConfig {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    passwordExpiration: number
    preventReuse: number
  }
  sessionSettings: {
    sessionTimeout: number
    maxConcurrentSessions: number
    rememberMeEnabled: boolean
    rememberMeDuration: number
  }
  registrationSettings: {
    allowSelfRegistration: boolean
    requireEmailVerification: boolean
    requireAdminApproval: boolean
    defaultRole: string
    allowedDomains: string[]
  }
  accountSettings: {
    enableTwoFactor: boolean
    enableAccountLockout: boolean
    maxLoginAttempts: number
    lockoutDuration: number
    enablePasswordReset: boolean
  }
}

export function UserSettings() {
  const [config, setConfig] = useState<UserConfig>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      passwordExpiration: 90,
      preventReuse: 5,
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxConcurrentSessions: 3,
      rememberMeEnabled: true,
      rememberMeDuration: 30,
    },
    registrationSettings: {
      allowSelfRegistration: false,
      requireEmailVerification: true,
      requireAdminApproval: true,
      defaultRole: "student",
      allowedDomains: [],
    },
    accountSettings: {
      enableTwoFactor: false,
      enableAccountLockout: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      enablePasswordReset: true,
    },
  })

  const [loading, setLoading] = useState(false)
  const [newDomain, setNewDomain] = useState("")

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Configuración de usuarios guardada",
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

  const addDomain = () => {
    if (newDomain && !config.registrationSettings.allowedDomains.includes(newDomain)) {
      setConfig({
        ...config,
        registrationSettings: {
          ...config.registrationSettings,
          allowedDomains: [...config.registrationSettings.allowedDomains, newDomain],
        },
      })
      setNewDomain("")
    }
  }

  const removeDomain = (domain: string) => {
    setConfig({
      ...config,
      registrationSettings: {
        ...config.registrationSettings,
        allowedDomains: config.registrationSettings.allowedDomains.filter((d) => d !== domain),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Política de Contraseñas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Política de Contraseñas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minLength">Longitud Mínima</Label>
              <Input
                id="minLength"
                type="number"
                min="4"
                max="32"
                value={config.passwordPolicy.minLength}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    passwordPolicy: { ...config.passwordPolicy, minLength: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Requerir Mayúsculas</Label>
                <Switch
                  checked={config.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, requireUppercase: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Requerir Minúsculas</Label>
                <Switch
                  checked={config.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, requireLowercase: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Requerir Números</Label>
                <Switch
                  checked={config.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, requireNumbers: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Requerir Caracteres Especiales</Label>
                <Switch
                  checked={config.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, requireSpecialChars: checked },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordExpiration">Expiración (días)</Label>
                <Input
                  id="passwordExpiration"
                  type="number"
                  min="0"
                  value={config.passwordPolicy.passwordExpiration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, passwordExpiration: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preventReuse">Prevenir Reutilización</Label>
                <Input
                  id="preventReuse"
                  type="number"
                  min="0"
                  value={config.passwordPolicy.preventReuse}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      passwordPolicy: { ...config.passwordPolicy, preventReuse: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Sesiones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configuración de Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                value={config.sessionSettings.sessionTimeout}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sessionSettings: { ...config.sessionSettings, sessionTimeout: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSessions">Máximo Sesiones Concurrentes</Label>
              <Input
                id="maxSessions"
                type="number"
                min="1"
                value={config.sessionSettings.maxConcurrentSessions}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sessionSettings: {
                      ...config.sessionSettings,
                      maxConcurrentSessions: Number.parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recordar Sesión</Label>
                <p className="text-sm text-muted-foreground">Permitir "Recordarme" en login</p>
              </div>
              <Switch
                checked={config.sessionSettings.rememberMeEnabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    sessionSettings: { ...config.sessionSettings, rememberMeEnabled: checked },
                  })
                }
              />
            </div>

            {config.sessionSettings.rememberMeEnabled && (
              <div className="space-y-2">
                <Label htmlFor="rememberDuration">Duración "Recordarme" (días)</Label>
                <Input
                  id="rememberDuration"
                  type="number"
                  min="1"
                  value={config.sessionSettings.rememberMeDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sessionSettings: {
                        ...config.sessionSettings,
                        rememberMeDuration: Number.parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuración de Registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configuración de Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-registro</Label>
                <p className="text-sm text-muted-foreground">Permitir registro sin invitación</p>
              </div>
              <Switch
                checked={config.registrationSettings.allowSelfRegistration}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    registrationSettings: { ...config.registrationSettings, allowSelfRegistration: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Verificación de Email</Label>
                <p className="text-sm text-muted-foreground">Requerir verificación por email</p>
              </div>
              <Switch
                checked={config.registrationSettings.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    registrationSettings: { ...config.registrationSettings, requireEmailVerification: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Aprobación de Admin</Label>
                <p className="text-sm text-muted-foreground">Requerir aprobación manual</p>
              </div>
              <Switch
                checked={config.registrationSettings.requireAdminApproval}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    registrationSettings: { ...config.registrationSettings, requireAdminApproval: checked },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultRole">Rol por Defecto</Label>
            <Select
              value={config.registrationSettings.defaultRole}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  registrationSettings: { ...config.registrationSettings, defaultRole: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="teacher">Docente</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="staff">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dominios Permitidos</Label>
            <div className="flex gap-2">
              <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="ejemplo.com" />
              <Button onClick={addDomain} variant="outline">
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.registrationSettings.allowedDomains.map((domain) => (
                <div key={domain} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                  <span className="text-sm">{domain}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeDomain(domain)} className="h-4 w-4 p-0">
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Seguridad de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">Habilitar 2FA para todos los usuarios</p>
              </div>
              <Switch
                checked={config.accountSettings.enableTwoFactor}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    accountSettings: { ...config.accountSettings, enableTwoFactor: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Bloqueo de Cuenta</Label>
                <p className="text-sm text-muted-foreground">Bloquear tras intentos fallidos</p>
              </div>
              <Switch
                checked={config.accountSettings.enableAccountLockout}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    accountSettings: { ...config.accountSettings, enableAccountLockout: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recuperación de Contraseña</Label>
                <p className="text-sm text-muted-foreground">Permitir reset por email</p>
              </div>
              <Switch
                checked={config.accountSettings.enablePasswordReset}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    accountSettings: { ...config.accountSettings, enablePasswordReset: checked },
                  })
                }
              />
            </div>
          </div>

          {config.accountSettings.enableAccountLockout && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Máximo Intentos de Login</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={config.accountSettings.maxLoginAttempts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      accountSettings: { ...config.accountSettings, maxLoginAttempts: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Duración Bloqueo (minutos)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="5"
                  value={config.accountSettings.lockoutDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      accountSettings: { ...config.accountSettings, lockoutDuration: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
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
